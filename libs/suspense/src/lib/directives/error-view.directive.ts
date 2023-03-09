import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[errorView]',
  standalone: true,
})
export class ErrorViewDirective {
  constructor(public tpl: TemplateRef<any>) {}
}
