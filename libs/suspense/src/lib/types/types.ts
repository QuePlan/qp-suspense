import { inject, Injectable, InjectionToken, OnDestroy, OnInit, Type } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, map, ObservableInput, takeUntil, tap } from 'rxjs';
import { EventService } from '../services/event.service';

export const SUSPENSE = new InjectionToken('SUSPENSE');

//Ref. https://netbasal.com/adding-suspense-to-angular-%EF%B8%8F-%EF%B8%8F-1f34fd603584
/**
 * Define la estructura esperada para un componente al que se pueda aplicar la 
 * lógica tipo Suspense (al estilo React, o Vue)
 */
export interface ISuspenseable {
  /**
   * Funcion de configuración o preparación de un componente de tipo Suspenseable
   * Debe responder al momento en que el componente esté efectivamente en condiciones de
   * ser desplegado.
   */
  setup(): ObservableInput<any>;

  /**
   * Cabe la posibilidad que el componente esté en un estado "listo para poder desplegarse"
   * una vez que se hayan ejecutado ciertos procesos, que serán capturados a través de los eventos:
   * - <eventName>:load una vez que el componente este listo
   * - <eventName>:error en caso que deba informarse un error
   * Este tipo de operación podríamos  interpretarlo como reactivo, ya que son eventos que
   * disparan ciertas acciones.
   * La implementación recomendada para esta función es:
   * ```
   * eventHandler(eventName: string): void {
   *   this.eventName = eventName;
   * }
   * ```
   * Si la variable eventName del componente Suspenseable no tiene valor definido, la carga del 
   * componente buscará realizarse luego de llamar la función `setup()`
   * @param eventName Nombre que servirá para identificar el evento a capturar
   */
  eventHandler(eventName: string): void;

  /**
   * En caso de estar habilitado el modo "reactivo" (habiendo definido el nombre del evento a capturar
   * en la variable eventName del componente de tipo Suspenseable), la función informará el estado de carga 
   * como listo. 
   */
  broadcastLoad(): void;

  /**
   * En caso de estar habilitado el modo "reactivo" (habiendo definido el nombre del evento a capturar
   * en la variable eventName del componente de tipo Suspenseable), la función informará un estado de error 
   * en la carga del componente. 
   */
  broadcastError(): void;

  /**
   * Funcion encargada de la inicialización del componente.
   * Pensada para absorber las operaciones que realiza ngOnInit().
   * Su implementación es opcional.
   */
  init(): void;
}

/**
 * Define la estructura que debe implementar un módulo que declare un componente Suspenseable no standalone
 */
export interface SuspenseableModule {
  /**
   * Debe retornar el componente Suspenseable que está declarado en el módulo
   */
  getComponent(): Type<Suspenseable>;
}

@Injectable()
export abstract class Suspenseable implements ISuspenseable, OnInit, OnDestroy {
  abstract ngOnInit(): void;
  abstract ngOnDestroy(): void;
  
  eventService : EventService = inject(EventService);
  eventName   ?: string;
  initialized = false;
  setupReady : BehaviorSubject<boolean> = new BehaviorSubject(false);
  hasError   : BehaviorSubject<boolean> = new BehaviorSubject(false);

  defaultEventDrivenSetup(response: { [key: string]: unknown }, useInit = false) {
    console.log('[defaultEventDrivenSetup] setup()');

    if(useInit) {
      this.init();
    }
    return this.setupReady.pipe(
      takeUntil( 
        combineLatest([this.setupReady, this.hasError]).pipe(
          filter(([ isReady, hasError ]) => isReady || hasError),
          tap( 
            ([ isReady, hasError ]) => {
              console.log('[defaultEventDrivenSetup] isReady, hasError: ', isReady, hasError );
              if (hasError) throw new Error('[defaultEventDrivenSetup] No se pudo cargar el componente');
            } 
          )
        )
      ),
      map(() => (response))
    );
  }

  init() {
    throw new Error('init() no implementado');
  }

  setup(): ObservableInput<any> {
    // Permite que en un contexto de desarrollo sepamos que este método no
    // está implementado => despliegue de estado de error para carga del componente
    // Aplica solamente para el modo de operación "normal" (usando  función `setup()` )
    throw new Error('setup() no implementado');
  }

  eventHandler(eventName: string): void {
    // Permite que en un contexto de desarrollo sepamos que este método no
    // está implementado => despliegue de estado de error para carga del componente
    // Aplica solamente para el modo de operación "reactivo" (variable `eventName` con valor definido )
    throw new Error('eventHandler() no implementado');
  }

  broadcastLoad(): void {
    // Sólo notifica el estado en caso de  estar operando en modo "reactivo"
    if (this.eventName) {      
      this.eventService.broadcast(`${this.eventName}:load`, true);
    }
  }

  broadcastError(): void {
    // Sólo notifica el estado en caso de  estar operando en modo "reactivo"
    if (this.eventName) {
      this.eventService.broadcast(`${this.eventName}:error`, true);
    }
  }
}

export const useSuspense = (comp: Type<Suspenseable>) => ({
  provide: SUSPENSE,
  useExisting: comp,
});
