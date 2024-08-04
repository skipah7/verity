import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { Shape } from '@core/enums';
import { valueAccessor } from '@core/utils/form-utils';
import { distinctUntilChanged } from 'rxjs';
import { ShapeSelectorComponent } from './shape-selector.component';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-wall-shapes',
  standalone: true,
  imports: [ReactiveFormsModule, ShapeSelectorComponent, NzIconDirective],
  providers: [valueAccessor(WallShapesComponent)],
  template: `
    <ng-container [formGroup]="form">
      <app-shape-selector formControlName="first" />
      <span nz-icon nzType="plus"></span>
      <app-shape-selector
        formControlName="second"
        [disabledShapes]="disabledShapes()"
      />
    </ng-container>
  `,
  styles: `
    @use 'styles' as *;

    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    span[nz-icon] {
      font-size: 20px;
      color: $white;
    }
  `,
})
export class WallShapesComponent implements ControlValueAccessor {
  disabledShapes = input<Shape[]>([]);

  readonly #fb = inject(NonNullableFormBuilder);
  readonly #destory = inject(DestroyRef);

  form = this.#fb.group({
    first: this.#fb.control<Shape | undefined>({
      value: undefined,
      disabled: true,
    }),
    second: this.#fb.control<Shape | undefined>(undefined),
  });

  disabled = signal(false);

  #onChange: (value: Shape[]) => void;
  #onTouched: () => void;

  constructor() {
    this.form.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.#destory))
      .subscribe(() => {
        const value = this.form.getRawValue();
        this.#onChange?.([value.first as Shape, value.second as Shape]);
      });
  }

  writeValue(value: [Shape, Shape]): void {
    if (!value) return;
    this.form.patchValue(
      { first: value[0], second: value[1] },
      { emitEvent: false },
    );
  }

  registerOnChange(onChange: (value: Shape[]) => void): void {
    this.#onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.#onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    const action = isDisabled ? 'disable' : 'enable';
    this.form.controls.second[action]({ emitEvent: false });
  }
}
