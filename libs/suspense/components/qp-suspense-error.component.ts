import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente qp-suspense-error
 * ==============================
 * Componente simple para el despliegue de errores de componentes
 * que se  intentaron cargar con qp-suspense. 
 * - No usa imágenes, sólo CSS.
 * - Su uso no está restringido a qp-suspense.
 * - Utiliza proyección de contenido para desplegar un texto breve 
 * (como descripción para el Error) en el bloque <ng-content>.
 * 
 * Cómo usarlo
 * --------------
 * ```
 * <qp-suspense-error>Falló carga de componente...</qp-suspense-error>
 * ```
 */
@Component({
  selector: 'qp-suspense-error',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="suspense-error-wrapper">
    <div class="suspense-error">
      <div class="octagon">&times;</div>
    </div>
    <p><ng-content></ng-content></p>
  </div>
  `,
  styles: [
    `
    .suspense-error-wrapper {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 10rem;
      max-width: 25rem;
      margin: 0 auto;
    }

    p {
      margin-top: revert;
      margin-left: 1rem;
    }

    .octagon {
      background-color: #b30000;
      width: 3rem;
      height: 3rem;
      background-size: 3rem 3rem;
      line-height: 2.7rem;
      text-align: center;
      font-family: sans-serif;
      font-size: 2.5rem;
      font-weight: bold;
      color: #fff;
      
      -webkit-clip-path: polygon(
        29% 0, 71% 0, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0 71%, 0 29%
      );
      -moz-clip-path: polygon(
        29% 0, 71% 0, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0 71%, 0 29%
      );
      -ms-clip-path: polygon(
        29% 0, 71% 0, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0 71%, 0 29%
      );
      clip-path: polygon(
        29% 0, 71% 0, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0 71%, 0 29%
      );
    }
    `
  ],
})
export class QpSuspenseErrorComponent {}
