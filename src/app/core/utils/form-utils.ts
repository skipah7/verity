import { Provider, Type } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export const valueAccessor: (component: Type<unknown>) => Provider = (
  component,
) => ({
  provide: NG_VALUE_ACCESSOR,
  multi: true,
  useExisting: component,
});
