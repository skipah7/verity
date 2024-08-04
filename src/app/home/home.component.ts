import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '@core/services/socket.service';
import { v4 as uuidv4 } from 'uuid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { filter, map } from 'rxjs';
import {
  BroadcastEventType,
  RoomUser,
  ShapeOrder,
  UserOrder,
  ValuesChangePayload,
  WallShapes,
  WallShapesOrder,
} from '@core/types';
import { StatueShapesComponent } from '../components/statue-shapes.component';
import { StatueUsersComponent } from '../components/statue-users.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StatueWallShapesComponent } from '../components/statue-wall-shapes.component';
import { AsyncPipe } from '@angular/common';
import { Shape } from '@core/enums';

const startingValuesValidator: ValidatorFn = (form) => {
  const shapes = form.get('shapes')?.getRawValue();
  const users = form.get('users')?.getRawValue();
  const wall = form.get('wall')?.getRawValue();
  if (!shapes || !users || !wall) return { missing: true };

  const shapesValid = shapes.every((shape: Shape) => !!shape);
  const usersValid = users.every((user: RoomUser) => !!user);
  const wallValid = wall.every((wallShapes: WallShapes) =>
    wallShapes.every((shape) => !!shape),
  );

  return shapesValid && usersValid && wallValid ? null : { missing: true };
};
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    AsyncPipe,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    StatueShapesComponent,
    StatueUsersComponent,
    StatueWallShapesComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  id = input.required<string>();

  readonly #router = inject(Router);
  readonly #fb = inject(NonNullableFormBuilder);
  readonly #destroy = inject(DestroyRef);
  readonly #socket = inject(SocketService);

  form = this.#fb.group(
    {
      shapes: this.#fb.control<ShapeOrder | undefined>(undefined),
      users: this.#fb.control<UserOrder | undefined>(undefined),
      wall: this.#fb.control<WallShapesOrder | undefined>(undefined),
    },
    { validators: [startingValuesValidator] },
  );

  username = signal('');
  currentUser = signal<RoomUser | undefined>(undefined);
  room = signal<RoomUser[]>([]);
  isStartingValuesValid = signal(false);

  isAdmin = computed(() => !!this.currentUser()?.isAdmin);

  get showWallSelector() {
    return this.form.controls.shapes.getRawValue()?.every((shape) => !!shape);
  }

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((value) => {
        if (!this.isAdmin()) return;

        this.#socket.broadcast({
          type: BroadcastEventType.VALUES_CHANGE,
          sender: this.currentUser() as RoomUser,
          payload: value as ValuesChangePayload,
        });
      });
    this.form.controls.shapes.valueChanges
      .pipe(
        filter((shapes) => !!shapes),
        map((shapes) => shapes.map((shape) => [shape, undefined])),
        takeUntilDestroyed(this.#destroy),
      )
      .subscribe((wallShapes) =>
        this.form.controls.wall.setValue(wallShapes as WallShapesOrder),
      );

    effect(() => {
      const action = this.isAdmin() ? 'enable' : 'disable';
      this.form[action]({ emitEvent: false });
    });
  }

  ngOnInit(): void {
    if (this.id()) return;

    this.#router.navigate([`/${uuidv4()}`]);
  }

  onJoinRoom() {
    this.#socket.connect(this.id(), this.username());
    this.#setSubscriptions();
  }

  #setSubscriptions() {
    this.#socket
      .roomUpdates$()
      .pipe(map((result) => result.room))
      .subscribe((result) => {
        this.room.set(result);

        if (this.currentUser()) return;
        const user = result.find((users) => users.name === this.username());
        this.currentUser.set(user);
      });

    this.#socket.broadcast$().subscribe((data) => {
      const isSentByCurrentUser = data.sender.id === this.currentUser()?.id;
      if (
        !isSentByCurrentUser &&
        data.type === BroadcastEventType.VALUES_CHANGE
      ) {
        this.form.setValue(data.payload, { emitEvent: false });
      }

      this.isStartingValuesValid.set(!startingValuesValidator(this.form));
    });
  }
}
