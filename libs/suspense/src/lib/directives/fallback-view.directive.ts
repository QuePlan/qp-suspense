import { Directive, TemplateRef } from '@angular/core';

/**
 * Directiva para definir el área contenedora donde se desplegará el
 * componente/contenido asociado al estado de "carga en curso/proceso"
 * para un componente de tipo Suspenseable.
 */
@Directive({
  selector: '[fallbackView]',
  standalone: true,
})
export class FallbackViewDirective {
  constructor(public tpl: TemplateRef<any>) {}
}
