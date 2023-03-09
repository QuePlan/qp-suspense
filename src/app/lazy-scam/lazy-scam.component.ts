import { Component, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Suspenseable, SuspenseableModule } from '@queplan/suspense';

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
  getComponent(): Type<Suspenseable> {
    return LazyScamComponent;
  }
}
