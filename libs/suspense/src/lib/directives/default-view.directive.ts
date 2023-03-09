import { Directive, Input, Type } from '@angular/core';
import { Suspenseable } from '../types/types';

export type TDefaultSuspenseable = { default: Type<Suspenseable> };

@Directive({
  selector  : '[defaultView]',
  standalone: true,
})
export class DefaultViewDirective {
  @Input('defaultView') fetch: () => Promise<TDefaultSuspenseable> | Promise<Type<unknown>>;
  @Input() componentParams   : { [key: string]: unknown };
  @Input() isModule          : boolean | string;
}
