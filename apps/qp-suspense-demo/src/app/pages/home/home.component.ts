import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuspenseComponent } from '@queplan/qp-suspense';
import { DefaultViewDirective, ErrorViewDirective, FallbackViewDirective } from '@queplan/qp-suspense/directives';
import { NotLazyComponent } from '../../not-lazy/not-lazy.component';
import { NotLazy2Component } from '../../not-lazy2/not-lazy2.component';
import { NotLazyEventdrivenComponent } from '../../not-lazy-eventdriven/not-lazy-eventdriven.component';
import { TestSuspenseableComponent } from '../../test-suspenseable/test-suspenseable.component';
import { HttpClientModule } from '@angular/common/http';

/**
 * Angular module to load not lazy components
 */
@NgModule({
  declarations: [
    NotLazyComponent,
    NotLazy2Component,
    NotLazyEventdrivenComponent,
    TestSuspenseableComponent,
  ],
  exports: [ 
    NotLazyComponent,
    NotLazy2Component,
    NotLazyEventdrivenComponent,
    TestSuspenseableComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
})
export class NotLazyModule {}


@Component({
  selector: 'queplan-home',
  standalone: true,
  imports: [
    CommonModule,
    NotLazyModule,
    SuspenseComponent,
    DefaultViewDirective,
    FallbackViewDirective,
    ErrorViewDirective
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  usersFactory = () => import('../../test/test.component');
  componentParams = { clazzName: 'TestComponent', origen: 'API mágica' };

  lazyInModuleFactory = () => import('../../lazy-in-module/lazy-in-module.module');
  lazyInModuleParams = { clazzName: 'LazyInModuleComponent', whoAmI: 'I am your father!!!!' };

  lazyStandaloneFactory = () => import('../../lazy-standalone/lazy-standalone.component');
  lazyStandaloneParams = { clazzName: 'LazyStandaloneComponent', message: '- Are you lazy? - Yes I am!!!' };

  condicionMagica = true;

}
