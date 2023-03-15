import {
  Component,
  ContentChild,
  ViewChild,
  ViewContainerRef,
  Type,
  Injector,
  ComponentRef,
  ContentChildren,
  QueryList,
  createComponent,
  inject,
  EnvironmentInjector,
  createNgModule,
  NgModuleRef,
} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { from, forkJoin, Subject, takeUntil, finalize, ObservableInput } from 'rxjs';
import { ISuspenseable, SUSPENSE, SuspenseableModule, SuspenseableRenderer, TDefaultSuspenseable } from '@queplan/qp-suspense/types';
import { DefaultViewDirective, FallbackViewDirective, ErrorViewDirective } from '@queplan/qp-suspense/directives';
import { EventService, YieldToMainService } from '@queplan/qp-suspense/services';

/**
 * Componente suspense
 * ========================
 * 
 * Implementación Angular de la lógica de carga de componentes tipo Suspense (al estilo React, o Vue).  
 * Carga de manera lazy un componente (usando imports dinámicos), y controla, a través del despliegue 
 * de estados, el estado de la carga de un componente:
 * 
 * - `defaultView`: Componente a ser cargado
 * - `fallbackView`: Componente a desplegar mientras el componente default está cargándose
 * - `errorView`: Componente de error que se despliega si es que fallara la carga del compoente default.
 * 
 * Ventajas
 * -----------
 * 
 * - Mejor UX,, el usuario ve el contenido de la página en la medida que se va disponibilizando (vs una página completa de loader).
 * - Mayor control sobre la carga de un componente (estados de carga y error).
 * - Minimización del bundle (imports dinamicos al momento de ser requeridos).
 * - Opción de definir prioridades de carga (a través de Webpack Magic comments).
 * 
 * Desventajas
 * -------------
 * 
 * - Sólo funciona para componentes definidos como Suspenseable.
 * - No soporta @Output() (este funcionamiento se puede reemplazar por eventos/comportamiento reactivo).
 * - Si el componente a desplegar está dentro de un módulo que está importado en otro lugar, 
 *   es casi lo mismo que no usarlo (no se le saca provecho a la carga dinámica).
 * - Su funcionamiento óptimo es usando componentes standalone al estilo de Angular 15.
 * - Si el componente no es standalone requiere que el modulo donde este esté definido implemente SuspenseableModule.
 * 
 * TL;DR Desventajas
 * -------------------
 * 
 * Hay que programar los componentes pensando en que serán Suspenseables.
 * 
 * Cómo se usa
 * -------------
 * 
 * 1. Se define el componente extendiendo la clase abstracta Suspenseable.
 * 2. Dependiendo de el modo de operación requerido se deberá reimplementar la función setup() o eventHandlers(). Al extender alguno de
 *    los subtipos Suspenseable, la misma implementación guía al desarrollador en que funciones debe reimplementar.
 * 3. El componente _padre_ debe definir variables para el contructor del componente y sus correspondientes parámetros.
 * 4. Uso modo por defecto (no reactivo, despliega cuando termina el setup()):
 * 
 * ```
 * <suspense>
 *  <ng-template [defaultView]="compFactory" [componentParams]="compParams" clazzName="CompComponent"></ng-template>
 * 
 *  <ng-template fallbackView><suspense-spinner>Cargando Comp...</suspense-spinner></ng-template>
 *  <ng-template errorView><suspense-error>Falló carga de Comp</suspense-error></ng-template>
 * </suspense>
 * ```
 * 
 * `clazzName` puede ir como @Input() o como otro atributo dentro de @Input() componentParams:
 * `componentParams = { clazzName: 'CompComponent' };`
 * CompComponent debe extender de Suspenseable e implementar setup(), por ejemplo:
 * 
 * ```
 *   setup(): ObservableInput<any> {
 *     this.ngOnInit();
 *     return of({
 *       input: this.input,
 *       otherInput: this.otherInput, 
 *       anotherInput: this.anotherInput
 *     });
 *   }
 * ```
 * 
 * Si el componente no es standalone, se le debe indicar a defaultView que el componente debe importarse desde el módulo donde se lo declara.
 * El parámetro isModule puede tomar un valor booleano o bien el nombre específico del módulo que se requiere.
 * El módulo en cuestión debe implementar SuspenseableModule.  
 * **IMPORTANTE**: Si el módulo lleva un nombre  diferente al del componente, asegurese de ser específico en el nombre del módulo para evitar errores y lograr 
 * desplegar exitosamente el componente. A priori esto no debioera ser necesario ya que el componente *"sabe"* encontrar el nombre del módulo o del componente,
 * sin embargo siempre es bueno estar al tanto de esto.
 * 
 * ```
 *  <ng-template [defaultView]="compFactory" [componentParams]="compParams" clazzName="CompComponent" [isModule]="true"></ng-template>
 * ```
 * 
 * Errores
 * ---------
 * En la mayoría de los casos los errores son bastante explicativos (favor leer los mensajes en la consola), sin embargo hay algunos 
 * casos particulares que no resultan tan claros:
 * 
 * - `TypeError: Cannot read properties of undefined (reading 'ɵcmp')`: Quiere decir que no tiene una clase para poder instanciar el componente, lo que puede 
 *   por varios motivos:
 *   * El nombre de la clase no corresponde al del componente de tipo Suspenseable (Ej. está mal escrito, no existe)
 *   * El import dinámico para obtener el contructor del componente tiene errores (Ej. apunta a otro componente/módulo)
 *   * En caso que el componente esté declarado en un módulo (componente no-standalone), el módulo debe declarar y exportar el componente. El módulo debe implementar 
 *     SuspenseableModule
 * - Errores de compilacion en el template de un componente: Probablemente el componente de tipo Suspenseable tenga dependencias definidas en un módulo, por lo que 
 *   deberá indicarse isModule=true|<nombre del módulo>, y el módulo debe implementar SuspenseableModule
 * 
 * Para sacar mejor provecho de los lazy components se recomienda asegurar que el componente o su módulo asociado no esté importado en el componente padre (o su módulo),
 * ya que en ese caso el import se hace antes de que realmente sea necesario (pudiera haber casos donde sea válido, o necesario realizar antes la carga del módulo/componente).
 */
@Component({
  selector: 'suspense, [suspense]',
  template: `
    <ng-template #anchor></ng-template>
    <ng-content *ngIf="show"></ng-content>
  `,
  standalone: true,
  imports: [
    CommonModule, 
    NgIf,
    DefaultViewDirective, 
    FallbackViewDirective, 
    ErrorViewDirective
  ],
  providers: [ EventService ]
})
export class SuspenseComponent {
  /**
   * #anchor es el template contenedor de `suspense` donde se van a desplegar ya sea
   * el componente Suspenseable, o sus estados de "estoy cargando" o de error (si corresponde)
   */
  @ViewChild      ('anchor', { read: ViewContainerRef }) anchor: ViewContainerRef;

  /**
   * Las directivas definen las áreas del DOM donde se va a desplegar el componente que 
   * corresponda según el flujo de carga del componente Suspenseable
   */
  @ContentChild   (DefaultViewDirective) defaultView           : DefaultViewDirective;
  @ContentChild   (FallbackViewDirective) fallbackView         : FallbackViewDirective;
  @ContentChild   (ErrorViewDirective) errorView               : ErrorViewDirective;

  /**
   * Para el caso de requerir desplegar componentes Suspenseables de tipo "no-lazy" (ie que no se cargan dinámicamente)
   * se hace referencia a un QueryList de ISuspenseable. En estos casos **SE DEBE** indicar en el componente un provider que
   * señale explícitamente que es un componente de tipo Suspenseable, por ejemplo:
   * 
   * ```
   * @Component({
   *   selector: 'app-not-lazy',
   *   templateUrl: './not-lazy.component.html',
   *   styleUrls: [ './not-lazy.component.scss' ],
   *   providers: [ useSuspense(NotLazyComponent) ],
   * })
   * export class NotLazyComponent extends SuspenseableClassic  { ... }
   * ```
   */
  @ContentChildren(SUSPENSE as any) suspenseables              : QueryList<ISuspenseable>;
  // https://github.com/angular/angular/commit/97dc85ba5e4eb6cfa741908a04cfccb1459cec9b

  /**
   * Inyectores que permiten la incorporación de estos componentes en la vista.
   */
  environmentInjector: EnvironmentInjector = inject(EnvironmentInjector);
  injector           : Injector            = inject(Injector);


    /**
   * Servicio de eventos para comunicación entre componentes. Utilizado para el modo de operacion reactivo.
   */
  eventService: EventService = inject(EventService);

  /**
   * Boolean para controlar el despliegue del bloque d proyección de contenido. Esto va a aplicar en caso que se utilice un
   * componente Suspenseable de tipo "no-lazy" (ie que no se carga dinámicamente).
   */
  show = false;

  /**
   * Objeto de referencia para componente instanciado.
   */
  private compRef: ComponentRef<ISuspenseable>;  

    /**
   * Subject para control de suscripción sobre ejecución de función
   * setup() de componente Suspenseable en modo de operación "normal" (no reactivo)
   */
  private done: Subject<boolean> = new Subject<boolean>();

  constructor() {}

  /**
   * En caso que existan parámetros para el componente los asignará a la correspondiente instancia,
   * iterando por cada una de las llaves del objeto de parámetros.
   * 
   * @param compRef Instancia del componente a cargar
   * @param compParams Objeto con los parámetros que se van a asignar al componente (todos los @Input() )
   * @returns void en caso que no haya parámetros. Internamente modifica la instancia del componente entregado como parámetro.
   */
  setComponentParams<T>(compRef: T | ISuspenseable, compParams: { clazzName?: string | undefined, [key: string]: unknown } = {}) {
    const params: Array<string> = Object.keys(compParams).filter(v => v !== 'clazzName');
    if (!compParams || params.length === 0) return;
    
    params.forEach(param => {
      (compRef as any)[param as keyof typeof compRef] = compParams[param];
    });
  }

  /**
   * Crea una instancia del componente Suspenseable, y en caso que corresponda,
   * setea los parámetros (@Input()) correspondientes.
   * La instancia será creada de la clase del componente o desde el módulo donde este esté definido.
   * @param clazz Clase asociada al componente
   * @param componentParams Parámetros (@Input()) del componente
   * @param isModule Indica si el componente está dentro de un módulo
   * @param clazzName (opcional) Nombre de la clase del componente
   * @returns Instancia componente
   */
  private getComponentInstance(clazz: TDefaultSuspenseable | Type<unknown>, componentParams?: { clazzName?: string, [key: string]: unknown }, isModule: boolean | string = false, clazzName?: string): ComponentRef<ISuspenseable> {
    let componentInstance: ComponentRef<ISuspenseable>;

    /**
     * compClazz hace referencia a la clase del componente y será obtenidda según sea el valor de this.defaultView.isModule
     */
    let compClazz        : Type<ISuspenseable>;
    let isStandAlone = false;
    if (isModule) {
      console.log('Componente esta dentro de un modulo: ', clazz, Object.keys(clazz));
      const moduleName: string                         = (typeof isModule === 'string') ? isModule : Object.keys(clazz).shift() as string;
      const moduleRef: NgModuleRef<SuspenseableModule> = createNgModule(clazz[moduleName as keyof typeof clazz], this.injector)
            compClazz                                  = moduleRef.instance.getComponent();
    } else { 
      console.log('Componente es de tipo Suspenseable: ', clazz);
      let _clazzName: string | undefined = !clazzName ? ( !(clazz as TDefaultSuspenseable).default ? Object.keys(clazz).shift() as string : undefined ) : clazzName;
          compClazz                      = !_clazzName ? (clazz as TDefaultSuspenseable).default : (clazz as TDefaultSuspenseable)[_clazzName as keyof typeof clazz];
          isStandAlone                   = !!_clazzName;
    }
    
    /**
     * **IMPORTANTE**: Al crear la instancia del componente, si esto se hace usando `this.anchor.createComponent(compClazz)`, la instancia del componente es
     * INMEDIATAMENTE  agregada a la vista, independiente de si el componente está en un estado listo o no listo para ser desplegada.
     * Crear un componente simplemente con `createComponent()` no agrega el componente a la vista, sin embargo esto no funciona para componentes de tipo `standalone`.
     */
    componentInstance = isStandAlone ? this.anchor.createComponent(compClazz) : createComponent(compClazz, { environmentInjector: this.environmentInjector });
    // componentInstance = createComponent(compClazz, { environmentInjector: this.environmentInjector });
    this.setComponentParams(componentInstance.instance, componentParams);
    
    return componentInstance;
  }

  async ngAfterViewInit() {
    this.anchor.clear();

    /**
     * Crea la vista con el componente para desplegar el estado "cargando" (loader/spinner/otro)
     */
    this.anchor.createEmbeddedView(this.fallbackView.tpl, { index: 0 });
    const isLazy = this.defaultView?.fetch;

    /**
     * Si en su definición el componente no tiene un factory (es decir no define un import), fetch devolverá undefined
     * y por ende se entenderá que el componente no es lazy.
     */
    if (!isLazy) {
      console.log('Not lazy components.')

      /**
       * Recorre los componentes Suspenseable hijos y ejecuta la función setup() de cada uno de ellos.
       * Una vez que estén listos, se ejecuta la función renderComponenteReady() para desplegarlos en la vista.
       */
      const setup: Array<ObservableInput<any>> = this.suspenseables.map((comp) => { 
        return comp.setup();
      });
      forkJoin(setup).pipe(
        takeUntil(this.done),
        finalize(async () => await YieldToMainService.yieldToMain())
      ).subscribe({
        next: (_readyStatus?: Array<unknown>) => {
          this.suspenseables.forEach(comp => {
            (<unknown> comp as SuspenseableRenderer).renderComponenteReady();
          });
          this.anchor.clear();

          /**
           * Muestra el  ng-content (proyección de contenido)
           */
          this.show = true;
          this.done.next(true);
        },
        error: (_err) => {
          this.anchor.remove(0);
          this.anchor.createEmbeddedView(this.errorView.tpl);
          this.done.next(false);
        },
      });

      return;
    }

    let clazzName    = this.defaultView.getClazzName();

    /**
     * Fetch puede ser un import con prioridades (webpack magic comments)
     * @see https://medium.com/@geor.oikonomopoulos/angular-component-dynamic-import-prioritization-using-ngcomponentoutlet-d9681becba9b
     */
    const fetchClass = this.defaultView.fetch(clazzName);
    fetchClass().then((comp: TDefaultSuspenseable | Type<unknown>) => {
      this.compRef = this.getComponentInstance(comp, this.defaultView.componentParams, this.defaultView.isModule);

      if(!this.defaultView.onEvent) {
        console.log(`No hay evento para carga dinamica del componente.\nUsando setup().`);

        /**
         * La operación normal de suspense intentará desplegar el componente trás la 
         * ejecución de la función `setup(): ObservableInput<any>`
         * `done` se encargará de asegurar que el subscribe no genere una fuga de memoria.
         */
        from(this.compRef.instance.setup()).pipe(
          takeUntil(this.done),
          finalize(async () => await YieldToMainService.yieldToMain())
        ).subscribe({
          next: () => {
            (<unknown> this.compRef.instance as SuspenseableRenderer).renderComponenteReady();
            this.anchor.remove(0);
            this.anchor.insert(this.compRef.hostView);
            this.done.next(true);
          },
          error: () => {
            this.anchor.remove(0);
            this.anchor.createEmbeddedView(this.errorView.tpl);
            this.done.next(false);
          },
        });
      } else {
        const eventName = this.defaultView.onEvent;
        clazzName       = Object.keys(comp).shift() as string;
        if (!(clazzName?.toLowerCase())?.startsWith(eventName)) {
          this.done.next(false);
          throw new Error(`El evento debe usar el nombre del componente: ${(clazzName.toLowerCase()).replace('component', '')} y tiene el valor de: ${eventName}`);
        } else {
          /**
           * Caso de operación reactiva:
           * - Genera la instancia del componente
           * - Setea eventName en el componente (llamada a `eventHandlers()`)
           */
          console.log(`EventHandlers para ${clazzName}`);
          this.compRef.instance.eventHandler(eventName);

          /**
           * Declara los eventos a ser monitoreados:
           * - <eventName>:load para informar la carga (estado "ready") del componente
           * - <eventName>:error para informar algún error en la carga del componente
           * IMPORTANTE: Aquí no se tiene el detalle específico del error.
           */
          this.eventService.on(`${eventName}:load`, async () => {
            console.log(`${eventName}:load`);
            this.anchor.remove(0);
            this.anchor.insert(this.compRef.hostView);
            this.done.next(true);

            await YieldToMainService.yieldToMain();
          });  
          this.eventService.on(`${eventName}:error`, async () => {
            console.log(`${eventName}:error`);
            this.anchor.clear();
            this.anchor.createEmbeddedView(this.errorView.tpl);
            this.done.next(false);

            await YieldToMainService.yieldToMain();
          });
        }
      }
    })
    .catch((suspenseErr: unknown) => {
      this.done.next(false);
      console.error(`No se pudo generar instancia de component Suspense!`, suspenseErr);
      console.error('Verifique el tipo de componente implementado. Si es de tipo SuspenseableBroadcaster de debe indicar el nombre del evento en el @Input() onEvent');
      
      /**
       * En caso de error, limpia la vista y despliega el componente para desplegar el estado de error
       * en la carga del componente Suspenseable.
       */
      this.anchor.clear();
      this.anchor.createEmbeddedView(this.errorView.tpl);
    });

    // await YieldToMainService.yieldToMain();
  }

  ngOnDestroy() {
    /**
     * Elimina las referencias al componente que se ha cargado
     */
    this.compRef?.destroy();
    (this.compRef as any) = null;

    /**
     * En caso de operación reactiva, elimina los eventos usados para
     * notificar la carga o error en la carga del componente.
     * Son eventos "de un solo uso".
     */
    const eventName = this.defaultView.onEvent;
    if(eventName){
      this.eventService.off(`${eventName}:load`);
      this.eventService.off(`${eventName}:error`);
    }
  }
}
