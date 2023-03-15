import { Directive, TemplateRef } from '@angular/core';

/**
 * Directiva para definir el área contenedora donde se desplegará el
 * componente/contenido asociado al estado de error de carga de un 
 * componente de tipo Suspenseable.
 */
@Directive({
  selector: '[errorView]',
  standalone: true,
})
export class ErrorViewDirective {
  constructor(public tpl: TemplateRef<any>) {}
}
