import { Component, Input } from '@angular/core';
import { ObservableInput, of } from 'rxjs';
import { Suspenseable, SuspenseableClassic, SuspenseableInModule } from '@queplan/suspense';

@Component({
  selector: 'app-lazy-in-module',
  templateUrl: './lazy-in-module.component.html',
  styleUrls: ['./lazy-in-module.component.css'],
})
export class LazyInModuleComponent extends SuspenseableInModule {
  
  @Input() whoAmI: string;

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  setup(): ObservableInput<any> {
    return of({ whoAmI: this.whoAmI });
  }
}