import { Component, Input } from '@angular/core';
import { combineLatest, filter, map, ObservableInput, takeUntil, takeWhile, tap, timer } from 'rxjs';
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
    console.log('[NotLazyEventdrivenComponent] setup()');
    this.init();
    return this.setupReady.pipe(
      takeUntil( 
        combineLatest([this.setupReady, this.hasError]).pipe(
          filter(([ isReady, hasError ]) => isReady || hasError),
          tap( 
            ([ isReady, hasError ]) => {
              console.log('[NotLazyEventdrivenComponent] isReady, hasError: ', isReady, hasError );
              if (hasError) throw new Error('[NotLazyEventdrivenComponent] No se pudo cargar el componente');
            } 
          )
        )
      ),
      map( () => ({ eventName: this.eventNameRef }) )
    );
  }

  ngOnInit(): void {
    console.log('[NotLazyEventdrivenComponent] ngOnInit()');
    this.init();
  }
  ngOnDestroy(): void { }


}
