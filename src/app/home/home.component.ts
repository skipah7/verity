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
  UserOrder,
  ValuesChangePayload,
} from '@core/types';
import { StatueShapesComponent } from '../components/statue-shapes.component';
import { StatueUsersComponent } from '../components/statue-users.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    StatueShapesComponent,
    StatueUsersComponent,
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
    shapes: this.#fb.control<ShapeOrder | undefined>(undefined),
    users: this.#fb.control<UserOrder | undefined>(undefined),
  });

  username = signal('');
  currentUser = signal<RoomUser | undefined>(undefined);
  room = signal<RoomUser[]>([]);

  isAdmin = computed(() => !!this.currentUser()?.isAdmin);

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((value) => {
        this.#socket.broadcast({
          type: BroadcastEventType.VALUES_CHANGE,
          sender: this.currentUser() as RoomUser,
          payload: value as ValuesChangePayload,
        });
        console.log(value);
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
      if (data.sender.id === this.currentUser()?.id) return;

      if (data.type === BroadcastEventType.VALUES_CHANGE) {
        this.form.setValue(data.payload, { emitEvent: false });
      }
    });
  }
}
