import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ShapeSelectorComponent } from './shape-selector.component';
import {
  ControlValueAccessor,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { Shape, Statue } from '@core/enums';
import { AsyncPipe } from '@angular/common';
import { IncludesPipe } from '@core/pipes/includes.pipe';
import { distinctUntilChanged, map } from 'rxjs';
import { valueAccessor } from '@core/utils/form-utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-statue-shapes',
  standalone: true,
  imports: [
    AsyncPipe,
    IncludesPipe,
    ReactiveFormsModule,
    ShapeSelectorComponent,
  ],
  providers: [valueAccessor(StatueShapesComponent)],
  template: `
    <ng-container [formGroup]="form">
      @for (statue of statues; track $index) {
        <div class="statue">
          <span>{{ statue.label }}</span>
          <app-shape-selector
            [formControlName]="statue.statue"
            [disabledShapes]="(selectedShapes$ | async) ?? []"
          />
        </div>
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

    .statue {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
      min-width: 140px;
    }

    span {
      font-size: 16px;
      font-weight: 600;
    }
  `,
})
export class StatueShapesComponent implements ControlValueAccessor {
  readonly #fb = inject(NonNullableFormBuilder);
  readonly #destory = inject(DestroyRef);

  statues: { statue: Statue; label: string }[] = [
    { statue: Statue.LEFT, label: 'Left Statue' },
    { statue: Statue.MID, label: 'Middle Statue' },
    { statue: Statue.RIGHT, label: 'Right Statue' },
  ];

  form = this.#fb.group({
    [Statue.LEFT]: this.#fb.control<Shape | undefined>(undefined),
    [Statue.MID]: this.#fb.control<Shape | undefined>(undefined),
    [Statue.RIGHT]: this.#fb.control<Shape | undefined>(undefined),
  });

  selectedShapes$ = this.form.valueChanges.pipe(
    map((value) => Object.values(value).filter((value) => !!value)),
  );

  disabled = signal(false);

  #onChange: (value: Shape[]) => void;
  #onTouched: () => void;

  constructor() {
    this.form.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.#destory))
      .subscribe((value) => this.#onChange?.(Object.values(value)));
  }

  writeValue(value: [Shape, Shape, Shape]): void {
    if (!value) return;
    this.form.setValue({ ...value });
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
    this.form[action]();
  }
}
