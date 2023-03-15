import { BehaviorSubject, combineLatest, filter, map, ObservableInput, takeUntil, tap } from "rxjs";
import { ISuspenseable, SuspenseableRenderer } from "./types";

/**
 * Definición de la clase abstracta que permite implementar un componente de tipo Suspenseable en su modo de
 * operación en base a un control de estados de tipo evento. Sigue la misma lógica que el modo "normal" (usando  función `setup()`), sin embargo
 * el estado listo o error se determina en base al valor de las correspondientes variables de estado.
 * Se desconoce en que momento, y tras la ejecución de que operación/operaciones, el componente estará listo para ser desplegado. Por ello se disponibilizan
 * los BehaviorSubject `setupReady` y `hasError` para que el componente pueda notificar cuando se encuentre en estado listo o error.
 * 
 * * setupReady: Indicará que el componente está listo para ser desplegado
 * * hasError: Indicará que el componente no se pudo cargar debido a un estado de error
 * 
 * Se forzará la implementación de la función `setup()` para este subtipo de componentes Suspenseable, de paso se
 * provee la función `defaultEventDrivenSetup()` que permite implementar el control de estados de forma sencilla.
 */
export abstract class SuspenseableEventDriven  extends SuspenseableRenderer implements Pick<ISuspenseable, 'setup'> {
  /**
   * Variable de control para saber si ya está lista la inicializacion del componente.
   * Pudiera no utilizarse.
   */
  initialized = false;

  /**
   * Indica que el componente está listo para ser desplegado.
   * Como es un BehaviorSubject, admite un valor inicial.
   */
  setupReady : BehaviorSubject<boolean> = new BehaviorSubject(false);


  /**
   * Indica que el componente llegó a un estado de error, por lo que no debe ser desplegado.
   * Como es un BehaviorSubject, admite un valor inicial.
   */
  hasError   : BehaviorSubject<boolean> = new BehaviorSubject(false);


  /**
   * Implementación de la función `setup()` que permite aprovechar el control de estados de forma sencilla.
   * La idea es que dentro del mismo componente se seteen los valores para `setupReady` o para `hasError`. Llamando esta función desde `setup()` se
   * realiza el monitoreo de estas variables, asegurando que el componente efectivamente se despliegue cuando esté listo, o bien se informe el estado 
   * de error.
   * @param response { [key: string]: unknown } Objeto JSON (estructura a priori desconocida) que será devuelto como respuesta 
   * @param useInit { boolean } Indica si se debe llamar a la función `init()` antes de resolver la función `setup()`
   * @returns { ObservableInput<any> } Observable que se resolverá cuando el componente esté listo para ser desplegado. La respuesta es del mismo tipo que  la de setup()
   */
  defaultEventDrivenSetup(response: { [key: string]: unknown }, useInit = false): ObservableInput<any> {
    console.log('[defaultEventDrivenSetup] setup()');

    if(useInit) {
      this.init();
    }
    /**
     * Se suscribe inicialmente a setupReady.
     * Escuchará el observable mientras no este listo Ó tenga error, por ello se combina el observable.
     * Se filtra para que escuche alguna de las 2 respuestas y en caso de error lanzará una excepción (new Error).
     * Responde un observable con el objeto de respuesta indicado.
     */
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
    /**
     * Función de inicialización del componente, quizás sea pasar lo del ngInit a otra función.
     * Típicamente seteará la variable initialized a true.
     */
    throw new Error('init() no implementado');
  }
  
  abstract setup(): ObservableInput<any>;
}