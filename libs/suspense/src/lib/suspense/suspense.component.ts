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
import { TDefaultSuspenseable, DefaultViewDirective } from '../directives/default-view.directive';
import { FallbackViewDirective } from '../directives/fallback-view.directive';
import { from, forkJoin } from 'rxjs';
import { ErrorViewDirective } from '../directives/error-view.directive';
import { SUSPENSE, Suspenseable, SuspenseableModule } from '../types/types';
import { CommonModule, NgIf } from '@angular/common';

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
})
export class SuspenseComponent {
  @ViewChild('anchor', { read: ViewContainerRef }) anchor: ViewContainerRef;
  @ContentChild(DefaultViewDirective) defaultView: DefaultViewDirective;
  @ContentChild(FallbackViewDirective) fallbackView: FallbackViewDirective;
  @ContentChild(ErrorViewDirective) errorView: ErrorViewDirective;
  @ContentChildren(SUSPENSE as any) suspenseables: QueryList<Suspenseable>;
  // https://github.com/angular/angular/commit/97dc85ba5e4eb6cfa741908a04cfccb1459cec9b

  environmentInjector = inject(EnvironmentInjector);
  injector            = inject(Injector);

  show = false;
  private compRef: ComponentRef<Suspenseable>;

  constructor() {}

  setComponentParams(compRef: Suspenseable, compParams: { [key: string]: unknown }) {
    if (!compParams) return;
    const params: Array<string> = Object.keys(compParams).filter(v => v !== 'clazzName');
    for(let idx in params) {
      compRef[params[idx]] = compParams[params[idx]];
    }
  }

  ngAfterViewInit() {
    this.anchor.createEmbeddedView(this.fallbackView.tpl);
    const isLazy = this.defaultView?.fetch;

    if (!isLazy) {
      const setup = this.suspenseables.map((comp) => { 
        console.log('Not lazy comp: ', comp);
        return comp.setup();
      });
      forkJoin(setup).subscribe({
        next: (v?) => {
          console.log('==> ', v);
          this.anchor.clear();
          this.show = true;
        },
        error: (err) => {
          console.error('Not lazy error: ', err);
          this.anchor.remove();
          this.anchor.createEmbeddedView(this.errorView.tpl);
        },
      });
      return;
    }

    this.defaultView.fetch().then((comp: TDefaultSuspenseable | Type<unknown>) => {
      // const factory = this.resolver.resolveComponentFactory(comp.default);
      // this.compRef = factory.create(this.injector);
      let compClazz: Type<Suspenseable>;
      if (this.defaultView.isModule) {
        console.log('Componente esta dentro de un modulo: ', comp, Object.keys(comp));
        const moduleName: string = (typeof this.defaultView.isModule === 'string') ? this.defaultView.isModule : Object.keys(comp).shift();
        const moduleRef: NgModuleRef<SuspenseableModule> = createNgModule(comp[moduleName], this.injector)
        compClazz = moduleRef.instance.getComponent();
      } else { 
        console.log('Componente es de tipo Suspenseable: ', comp);
        compClazz = (comp as TDefaultSuspenseable).default;
      }
      
      this.compRef =  createComponent(compClazz, { environmentInjector: this.environmentInjector });
      this.setComponentParams(this.compRef.instance, this.defaultView.componentParams);

      from(this.compRef.instance.setup()).subscribe({
        next: () => {
          this.anchor.remove();
          this.anchor.insert(this.compRef.hostView);
        },
        error: () => {
          this.anchor.remove();
          this.anchor.createEmbeddedView(this.errorView.tpl);
        },
      });
    });
  }

  ngOnDestroy() {
    this.compRef?.destroy();
    this.compRef = null;
  }
}
