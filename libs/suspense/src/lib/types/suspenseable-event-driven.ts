import { BehaviorSubject, combineLatest, filter, map, ObservableInput, takeUntil, tap } from "rxjs";
import { ISuspenseable } from "./types";

export abstract class SuspenseableEventDriven implements Pick<ISuspenseable, 'setup'> {
  initialized = false;
  setupReady : BehaviorSubject<boolean> = new BehaviorSubject(false);
  hasError   : BehaviorSubject<boolean> = new BehaviorSubject(false);

  private defaultEventDrivenSetup(response: { [key: string]: unknown }, useInit = false) {
    console.log('[defaultEventDrivenSetup] setup()');

    if(useInit) {
      this.init();
    }
    return this.setupReady.pipe(
      takeUntil( 
        combineLatest([this.setupReady, this.hasError]).pipe(
          filter(([ isReady, hasError ]) => isReady || hasError),
          tap( 
            ([ isReady, hasError ]) => {
              console.log('[defaultEventDrivenSetup] isReady, hasError: ', isReady, hasError );
              if (hasError) throw new Error('[defaultEventDrivenSetup] No se pudo cargar el componente');
            } 
          )
        )
      ),
      map(() => (response))
    );
  }

  init() {
    throw new Error('init() no implementado');
  }
  
  abstract setup(): ObservableInput<any>;
}