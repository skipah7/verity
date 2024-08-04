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
} from '@angular/forms';
import { map } from 'rxjs';
import {
  BroadcastEventType,
  RoomUser,
  ShapeOrder,
  Trade,
  ValuesChangePayload,
  WallShapesOrder,
} from '@core/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { calculateInsideTradeSteps } from '@core/utils';
import { StartingValuesComponent } from '../components/starting-values.component';

const defaultStartingValue: any = {
  shapes: [undefined, undefined, undefined],
  users: [undefined, undefined, undefined],
  wall: [
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
  ],
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    JsonPipe,
    AsyncPipe,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    StartingValuesComponent,
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

  form = this.#fb.group({
    startingValue: this.#fb.control<ValuesChangePayload | undefined>(undefined),
  });
  username = signal('');
  currentUser = signal<RoomUser | undefined>(undefined);
  room = signal<RoomUser[]>([]);
  isStartingValuesValid = signal(false);
  tradeSteps = signal<Trade[][]>([]);

  isAdmin = computed(() => !!this.currentUser()?.isAdmin);

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((value) => {
        if (!this.isAdmin()) return;

        this.#socket.broadcast({
          type: BroadcastEventType.VALUES_CHANGE,
          sender: this.currentUser() as RoomUser,
          payload: value.startingValue as ValuesChangePayload,
        });
      });

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

  onReset() {
    this.form.reset({ startingValue: defaultStartingValue });
  }

  onCalculateSteps() {}

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
        this.form.controls.startingValue.setValue(data.payload, {
          emitEvent: false,
        });
      }

      const startingValue = this.form.controls.startingValue.getRawValue();
      if (!startingValue) return;
      this.isStartingValuesValid.set(
        this.#validateStartingValue(startingValue),
      );
      if (this.isStartingValuesValid()) {
        const tradeSteps = calculateInsideTradeSteps(
          startingValue.shapes as ShapeOrder,
          startingValue.wall as WallShapesOrder,
        );
        this.tradeSteps.set(tradeSteps);
      }
    });
  }

  #validateStartingValue(value: ValuesChangePayload) {
    if (!value.shapes || !value.users || !value.wall) return false;

    const shapesValid = value.shapes.every((shape) => !!shape);
    const usersValid = value.users.every((user) => !!user);
    const wallValid = value.wall.every((wallShapes) =>
      wallShapes.every((shape) => !!shape),
    );

    return shapesValid && usersValid && wallValid;
  }
}
