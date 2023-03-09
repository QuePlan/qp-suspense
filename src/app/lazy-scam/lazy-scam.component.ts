import { Component, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISuspenseable, SuspenseableInModule, SuspenseableModule } from '@queplan/suspense';

@Component({
  selector: 'app-lazy-scam',
  templateUrl: './lazy-scam.component.html',
  styleUrls: ['./lazy-scam.component.scss'],
})
export class LazyScamComponent extends SuspenseableInModule {
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
