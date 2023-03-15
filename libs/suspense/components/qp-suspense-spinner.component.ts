import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente qp-suspense-spinner
 * ==============================
 * Componente simple para el despliegue de un spinner de carga, para
 * componentes que se están cargando usando qp-suspense. 
 * - No usa imágenes, sólo CSS.
 * - Su uso no está restringido a qp-suspense.
 * - Utiliza proyección de contenido para desplegar un texto breve 
 * (como indicador sobre el Componente que se está cargando) en el bloque <ng-content>.
 * 
 * Cómo usarlo
 * --------------
 * ```
 * <qp-suspense-spinner>Cargando Componente...</qp-suspense-spinner>
 * ```
 * 
 * Opcionalmente se puede indicar el parámetro numérico [scale] para ajustar el tamaño del spinner:
 * ```
 * <qp-suspense-spinner [scale]="1.1">Cargando Componente...</qp-suspense-spinner>
 * ```
 */
@Component({
  selector: 'qp-suspense-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="suspense-wrapper">
    <span class="suspense-loader" [style.scale]="scale"></span>
    <p><ng-content></ng-content></p>
  </div>
  `,
  styles: [
    `
    .suspense-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 10rem;
      max-width: 25rem;
      margin: 0 auto;
    }
  
    .suspense-loader {  
      display: flex;
      justify-content: center;
      align-items: center;
  
      margin: auto 2.5rem; 
      width: 3rem;
      height: 3rem;
      border: 0.5rem solid;
      border-color: #cfd8dc transparent;
      border-radius: 50%;
      box-sizing: border-box;
      animation: suspense-rotation 1200ms cubic-bezier(0.645, 0.045, 0.355, 1) infinite;
    }
    .suspense-loader::after {  
      display: flex;
      justify-content: center;
      align-items: center;
  
      content: '';
      width: 1.1rem;
      height: 1.1rem;
      margin: auto;
      border-radius: 50%;
      background-color: var(--primary);
      box-sizing: border-box;
      transform: translate3d(0,0,0);
    }
  
    @keyframes suspense-rotation {
      0% {
        transform: translate3d(0, 0, 0) rotate(0deg);
      }
      100% {
        transform: translate3d(0, 0, 0) rotate(360deg);
      }
    }
    `
  ],
})
export class QpSuspenseSpinnerComponent {
  @Input() scale = 1.8;
}
