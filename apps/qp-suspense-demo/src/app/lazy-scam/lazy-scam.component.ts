import { Component, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISuspenseable, Suspenseable, SuspenseableModule } from '@queplan/qp-suspense/types';

@Component({
  selector: 'app-lazy-scam',
  templateUrl: './lazy-scam.component.html',
  styleUrls: ['./lazy-scam.component.scss'],
})
export class LazyScamComponent extends Suspenseable {
  ngOnInit(): void { }
  ngOnDestroy(): void { }
}

@NgModule({
  imports: [CommonModule],
  declarations: [LazyScamComponent],
  exports: [LazyScamComponent],
})
export class LazyScamComponentModule implements SuspenseableModule {
  getComponent(): Type<ISuspenseable> {
    return LazyScamComponent;
  }
}
