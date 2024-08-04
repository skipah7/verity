import { Component, input, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { Shape } from '@core/enums';
import { valueAccessor } from '@core/utils/form-utils';
import { NzIconDirective } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-shape-selector',
  standalone: true,
  imports: [NzIconDirective],
  providers: [valueAccessor(ShapeSelectorComponent)],
  template: `
    @for (shape of shapes; let index = $index; track index) {
      @if (!value() || value() === shape.value) {
        <span
          [class.selected]="shape.value === value()"
          [class.disabled]="
            disabledShapes().includes(shape.value) || disabled()
          "
          nz-icon
          [nzType]="shape.icon"
          (click)="onShapeClick(shape.value)"
        ></span>
      }
    }
  `,
  styles: `
    @use 'styles' as *;

    :host {
      display: flex;
      gap: 12px;
    }

    span[nz-icon] {
      color: $secondary;
      font-size: 24px;
      transition: 200ms ease-in;

      &.disabled {
        color: $disabled;

        &:hover {
          cursor: not-allowed;
        }
      }

      &.selected {
        color: $primary;

        &:hover {
          cursor: pointer;
        }
      }

      &:hover {
        opacity: 0.8;
        cursor: pointer;
      }
    }
  `,
})
export class ShapeSelectorComponent implements ControlValueAccessor {
  disabledShapes = input<Shape[]>([]);

  shapes: { icon: string; value: Shape }[] = [
    { icon: 'verity:square', value: Shape.SQUARE },
    { icon: 'verity:triangle', value: Shape.TRIANGLE },
    { icon: 'verity:circle', value: Shape.CIRCLE },
  ];
  value = signal<Shape | undefined>(undefined);
  disabled = signal(false);

  #onChange: (value: Shape | undefined) => void;
  #onTouched: () => void;

  onShapeClick(shape: Shape) {
    if (this.disabled()) return;
    if (!this.value() && this.disabledShapes().includes(shape)) return;

    const value = this.value() ? undefined : shape;
    this.value.set(value);
    this.#onChange?.(value);
  }

  writeValue(value: Shape): void {
    this.value.set(value);
  }

  registerOnChange(onChange: (value: Shape | undefined) => void): void {
    this.#onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.#onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
