import { isPlatformBrowser } from '@angular/common';
import { ElementRef, inject, Injectable, InjectionToken, OnDestroy, OnInit, PLATFORM_ID, Renderer2, Type } from '@angular/core';
import { ObservableInput } from 'rxjs';
import { EventService, SuspenseCacheService } from '@queplan/qp-suspense/services';
import { SuspenseableBroadcaster } from './suspenseable-broadcaster';
import { SuspenseableClassic } from './suspenseable-classic';
import { SuspenseableEventDriven } from './suspenseable-event-driven';

export const SUSPENSE = new InjectionToken('SUSPENSE');

/**
 * Define la estructura esperada para un componente al que se pueda aplicar la 
 * lógica tipo Suspense (al estilo React, o Vue)
 * @see https://netbasal.com/adding-suspense-to-angular-%EF%B8%8F-%EF%B8%8F-1f34fd603584
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
  getComponent(): Type<ISuspenseable>;
}

/**
 * Un componente de tipo Suspenseable, dependiendo de como sea inyectado en la vista, pudiera ser desplegado
 * antes que se encuentre en un estado listo para ser desplegado. Dado que eso es un error, se define una
 * clase que se encargará de que el componente no sea desplegado hasta que se encuentre en un estado listo.
 * Al momento de cargar el componente, y de iniciar el proceso del constructor, y flujos del ciclo de vida de 
 * Angular (ngOnInit, ngAfterViewInit, etc), el componente ya se encuentra cargado en memoria, sin embargo se 
 * desconoce su estado. Estando en memoria, para eviar que se despliegue, se oculta el componente vía CSS usando 
 * `display: none`, y se desplegará, cambiando a `display: inherit` ó su valor inicial,  una vez que se encuentre 
 * en un estado listo.
 * 
 * Todos los subtipos de Suspenseable extienden de esta clase.
 */
export class SuspenseableRenderer {
  renderer: Renderer2    = inject(Renderer2);
  elementRef: ElementRef = inject(ElementRef);
  platformId: Object     = inject(PLATFORM_ID);

  defaultDisplay: string = 'inherit';


  /**
   * En caso que la operación sea desde dentro de un browser, se rescatará el valor CSS inicial/original de `display` 
   * del componente, y se cambiará a none, de esa manera se oculta el componente (asumiendo un estado *no listo*).
   */
  constructor() {
    if(isPlatformBrowser(this.platformId)) {
      this.defaultDisplay = window.getComputedStyle(this.elementRef.nativeElement).getPropertyValue('display');
      this.renderer.setStyle(this.elementRef.nativeElement, 'display', 'none');
    } 
  }

  /**
   * En caso que la operación sea desde dentro de un browser, se cambia el valor de `display` a su valor inicial; de
   * esa manera se despliega el componente (asumiendo un estado *listo para ser desplegado*).
   */
  renderComponenteReady() {
    if(isPlatformBrowser(this.platformId)) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'display', this.defaultDisplay);  
    }
  }
}

/**
 * Clase abstracta que define la estructura de un componente de tipo Suspenseable.
 * Considera de manera muy inocente, todos los posibles casos de uso, y funciones posiblemente requeridas.
 * Es abstracta de modo de a lo menos obligar la implmentación de las interfaces OnInit y OnDestroy.
 */
@Injectable()
export abstract class Suspenseable extends SuspenseableRenderer implements ISuspenseable, OnInit, OnDestroy {
  abstract ngOnInit(): void;
  abstract ngOnDestroy(): void;
  
  /**
   * Servicio de eventos, requerido para el modo de operación "reactivo"
   */
  eventService : EventService = inject(EventService);

  /**
   * Nombre del evento a capturar, en caso de operar en modo "reactivo"
   */
  eventName   ?: string;

  init() {
    throw new Error('init() no implementado');
  }

  setup(): ObservableInput<any> {
    /**
     * Permite que en un contexto de desarrollo sepamos que este método no
     * está implementado => despliegue de estado de error para carga del componente
     * Aplica solamente para el modo de operación "normal" (usando  función `setup()` )
     */
    throw new Error('setup() no implementado');
  }

  eventHandler(eventName: string): void {
    /**
     * Permite que en un contexto de desarrollo sepamos que este método no
     * está implementado => despliegue de estado de error para carga del componente
     * Aplica solamente para el modo de operación "reactivo" (variable `eventName` con valor definido )
     */
    throw new Error('eventHandler() no implementado');
  }

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

/**
 * Clase abstracta que define la estructura de un componente de tipo Suspenseable aplicable cuando el  componente se encuentra
 * definido dentro de un módulo. A priori se desconoce que subtipo de componente Suspenseable será, por lo que lo menos malo es
 * usar la clase abstracta Suspenseable, y definir explícitamente todos los métodos que se requieran.
 */
export abstract class SuspenseableInModule extends Suspenseable {}

/**
 * Tipo especial para la respuesta del import de un componente definido como Suspenseable.
 * Usando el atributo default se evita requerir expresamente el nombre del componente.
 */
export type TDefaultSuspenseable   = { default: Type<Suspenseable> };

/**
 * Tipo de la promesa utilizada en la directiva defaultView para la carga de un componente Suspenseable.
 * Componentes Suspenseable "normales" son de tipo Promise<TDefaultSuspenseable>
 * Componentes Suspenseable "standalone" o aquellos que cuyo factory sea el módulo donde están definidos son de tipo Promise<Type<unknown>>
 * 
 */
export type SuspenseFactoryPromise = () => Promise<TDefaultSuspenseable> | Promise<Type<unknown>>;

/**
 * Tipo general para los componentes de tipo Suspenseable.
 * Sabemos que es Suspenseable, pero no sabemos que tipo de Suspenseable es.
 */
export type TSuspenseable = Type<Suspenseable | SuspenseableClassic | SuspenseableEventDriven | SuspenseableBroadcaster | SuspenseableInModule>;

/**
 * Se utiliza como proveedor de un componente de tipo Suspenseable que es cargado de modo "no lazy" (es decir sin un import explícito).
 * En este caso, lo más habitual es que los componentes esten definidos dentro de un módulo.
 * @param comp {TSuspenseable} Componente de tipo Suspenseable
 * @returns 
 */
export const useSuspense = (comp: TSuspenseable) => ({
  provide: SUSPENSE,
  useExisting: comp,
});

/**
 * InjectionToken para servicio de eventos.
 * Se define de esta manera para asegurarse que sea efectivamente un Singleton, y que sea posible reutilizar 
 * el objeto.
 */
export const EVENT_SERVICE = new InjectionToken<EventService>('EventService', {
  providedIn: 'root',
  factory: () => {
    // console.log('EVENT_SERVICE', new Date());
    return inject(EventService);
  }
});

/**
 * InjectionToken para servicio de caché para clases de componentes importados dinamicamente.
 * Se define de esta manera para asegurarse que sea efectivamente un Singleton, y que sea posible reutilizar 
 * el objeto.
 */
export const SUSPENSE_CACHE = new InjectionToken<SuspenseCacheService<any>>('SuspenseCache', {
  providedIn: 'root',
  factory: () => {
    // console.log('SUSPENSE_CACHE', new Date());
    return inject(SuspenseCacheService<any>);
  }
});

/**
 * Función deno-operación que permite deshabilitar la consola del navegador.
 */
const _noOp                 =  () => {};

/**
 * Variable de respaldo de la consola del navegador en si estado original.
 */
const  originalConsole      = console;

/**
 * InjectionToken para habilitar o deshabilitar la consola del navegador.
 * Si está en true se habilita, si está en false se deshabilita. Se utiliza como `provider` en el
 * `app.module` de la aplicación.  
 * ```
 * providers: [
 *    {
 *       provide: DEBUG_SUSPENSE,
 *       useValue: false // true para habilitar la consola del navegador
 *     },
 *   ],
 * ```
 */
export let DEBUG_SUSPENSE = new InjectionToken<boolean>('DEBUG_SUSPENSE',{
  providedIn: 'root',
  factory: () => false
});

/**
 * Habilita o deshabilita la consola del navegador en función del parámetro que reciba.
 * @param debug {boolean} Indica si se debe habilitar o deshabilitar la consola del navegador.
 * @returns Función de console a utilizar.
 */
export const toggleConsole  = (debug: boolean = false): Console => {
  let newConsole: Console = originalConsole;
  if (!debug) {
    (newConsole as any) = {
      log  : _noOp,
      warn : _noOp,
      debug: _noOp,
      info : _noOp,
    };
  }

  return newConsole;
};

/**
 * InjectionToken para exponer la consola del navegador.
 * La consola que  será disponibilizada será bajo el contexto de la líbrería, de modo de no afectar el comportamiento
 * de las demás aplicaciones.
 */
export const SUSPENSE_LOG = new InjectionToken<Console>('SUSPENSE_LOG',
{
  providedIn: 'root',
  factory   : () => toggleConsole(inject(DEBUG_SUSPENSE))
});
