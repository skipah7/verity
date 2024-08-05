import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import {
  ControlValueAccessor,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
} from '@angular/forms';
import { StatueShapesComponent } from './statue-shapes.component';
import { StatueUsersComponent } from './statue-users.component';
import { StatueWallShapesComponent } from './statue-wall-shapes.component';
import { Shape } from '@core/enums';
import {
  RoomUser,
  ShapeOrder,
  UserOrder,
  ValuesChangePayload,
  WallShapes,
  WallShapesOrder,
} from '@core/types';
import { filter, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { valueAccessor } from '@core/utils/form-utils';

@Component({
  selector: 'app-starting-values',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    StatueShapesComponent,
    StatueUsersComponent,
    StatueWallShapesComponent,
  ],
  providers: [valueAccessor(StartingValuesComponent)],
  template: `
    <ng-container [formGroup]="form">
      <app-statue-shapes formControlName="shapes" />
      <app-statue-users formControlName="users" [users]="users()" />
      @if (showWallSelector && showWallShapes()) {
        <div class="wall-shapes">
          <span class="wall-shapes-header">Wall Shapes</span>
          <app-statue-wall-shapes formControlName="wall" />
        </div>
      }
    </ng-container>
  `,
  styles: `
    @use 'styles' as *;

    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .wall-shapes {
      display: flex;
      flex-direction: column;
      gap: 8px;

      span {
        font-weight: 600;
        font-size: 24px;
        text-align: center;
      }
    }
  `,
})
export class StartingValuesComponent implements ControlValueAccessor {
  users = input<RoomUser[]>([]);
  showWallShapes = input(true);

  readonly #fb = inject(NonNullableFormBuilder);
  readonly #destroy = inject(DestroyRef);

  form = this.#fb.group({
    shapes: this.#fb.control<ShapeOrder | undefined>(undefined),
    users: this.#fb.control<UserOrder | undefined>(undefined),
    wall: this.#fb.control<WallShapesOrder | undefined>(undefined),
  });

  disabled = signal(false);

  #onChange: (value: ValuesChangePayload) => void;
  #onTouched: () => void;

  get showWallSelector() {
    return this.form.controls.shapes.getRawValue()?.every((shape) => !!shape);
  }

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.#destroy))
      .subscribe((value) => this.#onChange?.(value as ValuesChangePayload));
    this.form.controls.shapes.valueChanges
      .pipe(
        filter((shapes) => !!shapes),
        map((shapes) => shapes.map((shape) => [shape, undefined])),
        takeUntilDestroyed(this.#destroy),
      )
      .subscribe((wallShapes) =>
        this.form.controls.wall.setValue(wallShapes as WallShapesOrder),
      );
  }

  writeValue(value: ValuesChangePayload): void {
    if (!value) return;
    this.form.setValue(value, { emitEvent: false });
  }

  registerOnChange(onChange: (value: ValuesChangePayload) => void): void {
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
