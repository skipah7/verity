import { AsyncPipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { Statue } from '@core/enums';
import { RoomUser } from '@core/types';
import { valueAccessor } from '@core/utils/form-utils';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-statue-users',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, NzSelectModule],
  providers: [valueAccessor(StatueUsersComponent)],
  template: `
    <ng-container [formGroup]="form">
      @for (selector of selectors; track $index) {
        <nz-select
          nzAllowClear
          [formControlName]="selector.statue"
          [nzPlaceHolder]="selector.label"
          [compareWith]="compareWith"
        >
          @for (user of filteredUsers(); track $index) {
            <nz-option [nzValue]="user" [nzLabel]="user.name"></nz-option>
          }
        </nz-select>
      }
    </ng-container>
  `,
  styles: `
    @use 'styles' as *;

    :host {
      display: flex;
      gap: 32px;
      justify-content: space-between;
    }

    nz-select {
      min-width: 140px;
    }
  `,
})
export class StatueUsersComponent implements ControlValueAccessor {
  users = input<RoomUser[]>([]);

  readonly #fb = inject(NonNullableFormBuilder);
  readonly #destory = inject(DestroyRef);

  selectors: { statue: Statue; label: string }[] = [
    { statue: Statue.LEFT, label: 'Left Player' },
    { statue: Statue.MID, label: 'Middle Player' },
    { statue: Statue.RIGHT, label: 'Right Player' },
  ];

  form = this.#fb.group({
    [Statue.LEFT]: this.#fb.control<RoomUser | undefined>(undefined),
    [Statue.MID]: this.#fb.control<RoomUser | undefined>(undefined),
    [Statue.RIGHT]: this.#fb.control<RoomUser | undefined>(undefined),
  });

  selectedUsers = signal<RoomUser[]>([]);
  filteredUsers = computed(() => {
    const selected = this.selectedUsers();
    return this.users().filter((user) => !selected.includes(user));
  });
  compareWith = (u1: RoomUser, u2: RoomUser) => u1?.id === u2?.id;

  disabled = signal(false);

  #onChange: (value: RoomUser[]) => void;
  #onTouched: () => void;

  constructor() {
    this.form.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.#destory))
      .subscribe((value) => {
        const selected = Object.values(value);
        this.#onChange?.(selected);
        this.selectedUsers.set(selected.filter((user) => !!user));
      });
  }

  writeValue(value: [RoomUser, RoomUser, RoomUser]): void {
    if (!value) return;
    this.form.patchValue({ ...value });
  }

  registerOnChange(onChange: (value: RoomUser[]) => void): void {
    this.#onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.#onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    const action = isDisabled ? 'disable' : 'enable';
    this.form[action]({ emitEvent: false });
  }
}
