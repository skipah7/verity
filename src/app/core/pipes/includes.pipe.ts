import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includes',
  standalone: true,
})
export class IncludesPipe<T> implements PipeTransform {
  transform(array: T[], value: T): boolean {
    return array.includes(value);
  }
}
