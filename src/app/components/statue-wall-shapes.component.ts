import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ShapeSelectorComponent } from './shape-selector.component';
import { valueAccessor } from '@core/utils/form-utils';
import {
  ControlValueAccessor,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { WallShapes } from '@core/types';
import { Shape, Statue } from '@core/enums';
import { distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WallShapesComponent } from './wall-shapes.component';

@Component({
  selector: 'app-statue-wall-shapes',
  standalone: true,
  imports: [ReactiveFormsModule, ShapeSelectorComponent, WallShapesComponent],
  providers: [valueAccessor(StatueWallShapesComponent)],
  template: `
    <ng-container [formGroup]="form">
      @for (wall of walls; track $index) {
        <app-wall-shapes
          [formControlName]="wall.statue"
          [disabledShapes]="doubleShapes"
        />
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

    app-wall-shapes {
      min-width: 140px;
    }
  `,
})
export class StatueWallShapesComponent implements ControlValueAccessor {
  readonly #fb = inject(NonNullableFormBuilder);
  readonly #destory = inject(DestroyRef);

  walls: { statue: Statue; label: string }[] = [
    { statue: Statue.LEFT, label: 'Left Wall' },
    { statue: Statue.MID, label: 'Middle Wall' },
    { statue: Statue.RIGHT, label: 'Wall' },
  ];

  form = this.#fb.group({
    [Statue.LEFT]: this.#fb.control<WallShapes | undefined>(undefined),
    [Statue.MID]: this.#fb.control<WallShapes | undefined>(undefined),
    [Statue.RIGHT]: this.#fb.control<WallShapes | undefined>(undefined),
  });

  disabled = signal(false);

  #onChange: (value: WallShapes[]) => void;
  #onTouched: () => void;

  get doubleShapes() {
    const wallShapes = Object.values(this.form.getRawValue()).flat();
    return wallShapes.filter(
      (shape, index) => wallShapes.indexOf(shape) !== index,
    ) as Shape[];
  }

  constructor() {
    this.form.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.#destory))
      .subscribe((value) => this.#onChange?.(Object.values(value)));
  }

  writeValue(value: [WallShapes, WallShapes, WallShapes]): void {
    if (!value) return;
    this.form.setValue({ ...value }, { emitEvent: false });
  }

  registerOnChange(onChange: (value: WallShapes[]) => void): void {
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
