import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[fallbackView]',
  standalone: true,
})
export class FallbackViewDirective {
  constructor(public tpl: TemplateRef<any>) {}
}
