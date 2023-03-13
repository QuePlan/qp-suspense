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
import { from, forkJoin, Subject, takeUntil, finalize } from 'rxjs';
import { ISuspenseable, SUSPENSE, SuspenseableModule, SuspenseableRenderer, TDefaultSuspenseable } from '../types/types';
import { DefaultViewDirective, FallbackViewDirective, ErrorViewDirective } from '../directives';
import { EventService, YieldToMainService } from '../services';

@Component({
  selector: 'suspense',
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
  @ViewChild      ('anchor', { read: ViewContainerRef }) anchor: ViewContainerRef;
  @ContentChild   (DefaultViewDirective) defaultView           : DefaultViewDirective;
  @ContentChild   (FallbackViewDirective) fallbackView         : FallbackViewDirective;
  @ContentChild   (ErrorViewDirective) errorView               : ErrorViewDirective;
  @ContentChildren(SUSPENSE as any) suspenseables              : QueryList<ISuspenseable>;
  // https://github.com/angular/angular/commit/97dc85ba5e4eb6cfa741908a04cfccb1459cec9b

  environmentInjector = inject(EnvironmentInjector);
  injector            = inject(Injector);
  eventService        = inject(EventService);

  show = false;
  private compRef: ComponentRef<ISuspenseable>;  

    /**
   * Subject para control de suscripción sobre ejecución de función
   * setup() de componente Suspenseable en modo de operación "normal" (no reactivo)
   */
  private done: Subject<boolean> = new Subject<boolean>();

  constructor() {}

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
   * @returns Instancia componente
   */
  private getComponentInstance(clazz: TDefaultSuspenseable | Type<unknown>, componentParams?: { clazzName?: string, [key: string]: unknown }, isModule: boolean | string = false): ComponentRef<ISuspenseable> {
    let componentInstance: ComponentRef<ISuspenseable>;
    let compClazz        : Type<ISuspenseable>;
    let isStandAlone = false;
    if (isModule) {
      console.log('Componente esta dentro de un modulo: ', clazz, Object.keys(clazz));
      const moduleName: string                         = (typeof isModule === 'string') ? isModule : Object.keys(clazz).shift() as string;
      const moduleRef: NgModuleRef<SuspenseableModule> = createNgModule(clazz[moduleName as keyof typeof clazz], this.injector)
            compClazz                                  = moduleRef.instance.getComponent();
    } else { 
      console.log('Componente es de tipo Suspenseable: ', clazz);
      const clazzName: string | undefined = !(clazz as TDefaultSuspenseable).default ? Object.keys(clazz).shift() as string : undefined;
            compClazz                     = !clazzName ? (clazz as TDefaultSuspenseable).default : (clazz as TDefaultSuspenseable)[clazzName as keyof typeof clazz];
            isStandAlone                  = !!clazzName;
    }
    
    componentInstance = isStandAlone ? this.anchor.createComponent(compClazz) : createComponent(compClazz, { environmentInjector: this.environmentInjector });
    // componentInstance = createComponent(compClazz, { environmentInjector: this.environmentInjector });
    this.setComponentParams(componentInstance.instance, componentParams);
    
    return componentInstance;
  }

  async ngAfterViewInit() {
    this.anchor.clear();
    this.anchor.createEmbeddedView(this.fallbackView.tpl, { index: 0 });
    const isLazy = this.defaultView?.fetch;

    if (!isLazy) {
      console.log('Not lazy components.')
      const setup = this.suspenseables.map((comp) => { 
        return comp.setup();
      });
      forkJoin(setup).subscribe({
        next: (_readyStatus?: Array<unknown>) => {
          this.suspenseables.forEach(comp => {
            (<unknown> comp as SuspenseableRenderer).renderComponenteReady();
          });
          this.anchor.clear();
          this.show = true;
        },
        error: (_err) => {
          this.anchor.remove(0);
          this.anchor.createEmbeddedView(this.errorView.tpl);
        },
      });

      return;
    }

    let clazzName    = this.defaultView.getClazzName();
    const fetchClass = this.defaultView.fetch(clazzName);
    fetchClass().then((comp: TDefaultSuspenseable | Type<unknown>) => {
      this.compRef = this.getComponentInstance(comp, this.defaultView.componentParams, this.defaultView.isModule);

      if(!this.defaultView.onEvent) {
        console.log(`No hay evento para carga dinamica del componente.\nUsando setup().`);

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
          // Caso de operación reactiva:
          // - Genera la instancia del componente
          // - Setea eventName en el componente (llamada a eventHandlers())
          console.log(`EventHandlers para ${clazzName}`);
          this.compRef.instance.eventHandler(eventName);

          // Declara los eventos a ser monitoreados:
          // - <eventName>:load para informar la carga (estado "ready") del componente
          // - <eventName>:error para informar algún error en la carga del componente
          // IMPORTANTE: Aquí no se tiene el detalle específico del error.
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
    .catch(suspenseErr => {
      this.done.next(false);
      console.error(`No se pudo generar instancia de component Suspense!`, suspenseErr);

      // En caso de error, limpia la vista y despliega el componente para desplegar el estado de error
      // en la carga del componente Suspenseable
      this.anchor.clear();
      this.anchor.createEmbeddedView(this.errorView.tpl);
    });

    await YieldToMainService.yieldToMain();
  }

  ngOnDestroy() {
    // Elimina las referencias al componente que se ha cargado
    this.compRef?.destroy();
    (this.compRef as any) = null;

    // En caso de operación reactiva, elimina los eventos usados para
    // notificar la carga o error en la carga del componente.
    // Son eventos "de un solo uso".
    const eventName = this.defaultView.onEvent;
    if(eventName){
      this.eventService.off(`${eventName}:load`);
      this.eventService.off(`${eventName}:error`);
    }
  }
}
