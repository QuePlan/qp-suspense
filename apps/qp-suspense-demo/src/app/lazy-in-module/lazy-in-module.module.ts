import { NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyInModuleComponent } from './lazy-in-module.component';
import { ISuspenseable, SuspenseableModule } from '@queplan/qp-suspense/types';

@NgModule({
  declarations: [ 
    LazyInModuleComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    LazyInModuleComponent,
  ]

})
export class LazyInModuleModule implements SuspenseableModule { 
  getComponent(): Type<ISuspenseable> {
    return LazyInModuleComponent;
  }
}
