import { inject } from "@angular/core";
import { EventService } from "../services/event.service";
import { ISuspenseable, SuspenseableRenderer } from "./types";

/**
 * Definición de clase abstracta para la implementación de un componente Suspenseable
 * cuya operación de en modo "reactivo", es decir basada en la captura de eventos que indiquen
 * cuando el componente está listo para ser desplegado o cuando se ha producido un error.
 * Sólo fuerza la definición del método `eventHandler()`, que debe definir el nombre del evento
 * a capturar.
 * 
 * Modo reactivo (el componente se despliega una vez recibido el evento `<eventName>:load`):
 * ```
 * <qp-suspense>
 *  <ng-template [queplanDefaultView]="compFactory" [componentParams]="compParams" clazzName="CompComponent" onEvent="comp"></ng-template>
 * 
 *  <ng-template queplanFallbackView><qp-suspense-spinner>Cargando Comp...</qp-suspense-spinner></ng-template>
 *  <ng-template queplanErrorView><qp-suspense-error>Falló carga de Comp</qp-suspense-error></ng-template>
 * </qp-suspense>
 * ```
 * El nombre del evento debe ser el mismo que el nombre del componente SuspenseableBroadcaster, sin el sufijo "Component";
 * y debe ser indicado como el @Input() `onEvent` del componente.
 * Si se especifica onEvent con algún error, el componente no se desplegará y el mensaje de error indicará la corrección a realizar.
 * En este modo, una vez que el componente realice las operaciones que lo disponibilizan para ser desplegado, se deberá incluir la 
 * correspondiente llamada al método `this.broadcastLoad()`.
 * Análogamente, en caso de error se deberá llamar al método `this.broadcastError()`.
 */
export abstract class SuspenseableBroadcaster extends SuspenseableRenderer implements Pick<ISuspenseable, 'eventHandler' | 'broadcastLoad' | 'broadcastError'> {
  /**
   * Servicio de eventos, requerido para el modo de operación "reactivo"
   */
  eventService : EventService = inject(EventService);

  /**
   * Nombre del evento a capturar, en caso de operar en modo "reactivo"
   */
  eventName   ?: string;
  
  abstract eventHandler(eventName: string): void;

  broadcastLoad(): void {
    /**
     * Sólo notifica el estado en caso de  estar operando en modo "reactivo"
     */
    if (this.eventName) {   
      this.renderComponenteReady();   
      this.eventService.broadcast(`${this.eventName}:load`, true);
    } else {
      throw new Error('Usando modo reactivo sin haber defido el nombre del evento. Verifique implementación de eventHandler()');
    }
  }

  broadcastError(): void {
    /**
     * Sólo notifica el estado en caso de  estar operando en modo "reactivo"
     */    
    if (this.eventName) {
      this.renderComponenteReady();
      this.eventService.broadcast(`${this.eventName}:error`, true);
    } else {
      throw new Error('Usando modo reactivo sin haber defido el nombre del evento. Verifique implementación de eventHandler()');
    }
  }
  
}