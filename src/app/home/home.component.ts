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
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  map,
  skip,
} from 'rxjs';
import {
  BroadcastEventType,
  RoomUser,
  ShapeOrder,
  UserOrder,
  UserTrade,
  ValuesChangePayload,
  WallShapesOrder,
} from '@core/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { calculateInsideTradeSteps } from '@core/utils';
import { StartingValuesComponent } from '../components/starting-values.component';
import { Shape, Statue, statueLabels } from '@core/enums';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzMessageService } from 'ng-zorro-antd/message';

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
    AsyncPipe,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    StartingValuesComponent,
    NzTimelineModule,
    NzTagModule,
    NzAlertModule,
    NzMessageModule,
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
  readonly #notify = inject(NzMessageService);

  form = this.#fb.group({
    startingValue: this.#fb.control<ValuesChangePayload | undefined>(undefined),
  });
  username = signal('');
  currentUser = signal<RoomUser | undefined>(undefined);
  room = signal<RoomUser[]>([]);
  statueLabels = statueLabels;

  tradeSteps = signal<UserTrade[] | undefined>(undefined);
  currentStep$ = new BehaviorSubject<number | undefined>(undefined);

  isAdmin = computed(() => !!this.currentUser()?.isAdmin);

  #lastTrade: Statue | undefined = undefined;
  #socketStep = new BehaviorSubject<number | undefined>(undefined);

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(0), takeUntilDestroyed(this.#destroy))
      .subscribe((value) => {
        if (!this.isAdmin()) return;

        this.#socket.broadcast({
          type: BroadcastEventType.VALUES_CHANGE,
          sender: this.currentUser() as RoomUser,
          payload: value.startingValue as ValuesChangePayload,
        });
      });
    this.#socketStep
      .pipe(skip(1), distinctUntilChanged(), takeUntilDestroyed(this.#destroy))
      .subscribe((step) => {
        this.#socket.broadcast({
          type: BroadcastEventType.STEP_CHANGE,
          sender: this.currentUser() as RoomUser,
          payload: { step },
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
    this.form.enable({ emitEvent: false });
    this.form.reset({ startingValue: defaultStartingValue });
    this.#socketStep.next(undefined);
  }

  onStart() {
    this.form.disable({ emitEvent: false });
    this.#socketStep.next(1);
  }

  onStepCompleted() {
    this.#socketStep.next((this.currentStep$.value as number) + 1);
  }

  #symmetricalDifference(array1: RoomUser[], array2: RoomUser[]) {
    return array1
      .filter((item1) => !array2.some((item2) => item1.id === item2.id))
      .concat(
        array2.filter(
          (item2) => !array1.some((item1) => item2.id === item1.id),
        ),
      );
  }
  #setSubscriptions() {
    this.#socket
      .roomUpdates$()
      .pipe(map((result) => result.room))
      .subscribe((result) => {
        if (this.room().length) {
          const difference = this.#symmetricalDifference(result, this.room());
          if (this.room().length > result.length) {
            this.#notify.warning(`${difference[0].name} left`);
          } else {
            this.#notify.info(`${difference[0].name} joined`);
          }
        }
        this.room.set(result);

        if (this.currentUser()) return;
        const user = result.find((users) => users.name === this.username());
        this.currentUser.set(user);
      });

    this.#socket.broadcast$().subscribe((data) => {
      const isSentByCurrentUser = data.sender.id === this.currentUser()?.id;

      if (data.type === BroadcastEventType.VALUES_CHANGE) {
        if (!isSentByCurrentUser) {
          this.form.controls.startingValue.setValue(data.payload, {
            emitEvent: false,
          });
        }
        this.#calculateTradeSteps();
      } else if (data.type === BroadcastEventType.STEP_CHANGE) {
        const step = data.payload.step;
        this.currentStep$.next(step);
        if (step && step > 1) {
          this.#notify.success(
            `${data.sender.name} completed step ${step - 1}`,
          );
        }

        if (step === undefined) {
          this.#lastTrade = undefined;
        }

        const tradeSteps = this.tradeSteps();
        if (step === 1 && tradeSteps) {
          this.#lastTrade = tradeSteps[tradeSteps.length - 1].targetStatue;
        }
        if (step === 7) {
          if (this.isAdmin()) {
            this.form.enable({ emitEvent: false });
            this.form.reset({ startingValue: defaultStartingValue });
          }
          this.currentStep$.next(undefined);
        }
      }
    });
  }

  #calculateTradeSteps() {
    const value = this.form.controls.startingValue.getRawValue();
    if (!value) return;

    const isValid = this.#validateStartingValue(value);
    if (!isValid) return this.tradeSteps.set(undefined);

    const tradeSteps = calculateInsideTradeSteps(
      value.shapes,
      value.wall,
      this.#lastTrade,
    );
    const userTrades: UserTrade[] = tradeSteps.map((trade) => {
      const sourceStatue = value.shapes.indexOf(trade.source);
      const targetStatue = value.shapes.indexOf(trade.target);
      const user = value.users[sourceStatue];
      return { ...trade, user, targetStatue };
    });
    this.tradeSteps.set(userTrades);
  }

  #validateStartingValue(
    value: ValuesChangePayload,
  ): value is { shapes: ShapeOrder; wall: WallShapesOrder; users: UserOrder } {
    if (!value.shapes || !value.users || !value.wall) return false;

    const shapesValid = value.shapes.every((shape) => !!shape);
    const usersValid = value.users.every((user) => !!user);
    const wallValid = value.wall.every((wallShapes) =>
      wallShapes.every((shape) => !!shape),
    );

    return shapesValid && usersValid && wallValid;
  }
}
