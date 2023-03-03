import { Component, Input } from '@angular/core';
import { ObservableInput, timer } from 'rxjs';
import { Suspenseable, useSuspense } from '../types';

@Component({
  selector: 'app-not-lazy-eventdriven',
  templateUrl: './not-lazy-eventdriven.component.html',
  styleUrls: ['./not-lazy-eventdriven.component.css'],
  providers: [ useSuspense(NotLazyEventdrivenComponent) ],
})
export class NotLazyEventdrivenComponent extends Suspenseable {
  @Input() eventNameRef: string;
  init() {
    if (this.initialized) {
      console.log('[NotLazyEventdrivenComponent] Componente ya inicializado');
      return;
    }

    console.log('[NotLazyEventdrivenComponent] Inicializandose...');
    this.initialized = true;
    timer(3500).subscribe(() => {
      console.log('[NotLazyEventdrivenComponent] Listo despues de 3.5s');
      this.setupReady.next(true);
      // this.hasError.next(true);
    })
  }
  setup(): ObservableInput<any> {
    const response = { eventName: this.eventNameRef };
    return this.defaultEventDrivenSetup(response, true);
  }

  ngOnInit(): void {
    console.log('[NotLazyEventdrivenComponent] ngOnInit()');
    this.init();
  }
  ngOnDestroy(): void { }


}
