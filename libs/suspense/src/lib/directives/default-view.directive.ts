import { Directive, Input } from '@angular/core';
import { SuspenseCacheService } from '../services';
import { SuspenseFactoryPromise } from '../types/types';

@Directive({
  selector  : '[defaultView]',
  standalone: true,
  providers : [ SuspenseCacheService ]
})
export class DefaultViewDirective {
  //@Input('defaultView') fetch: () => Promise<TDefaultSuspenseable> | Promise<Type<unknown>>;
  @Input('defaultView') componentFactory!: SuspenseFactoryPromise;  
  @Input() clazzName?         : string;
  @Input() componentParams?   : { 
    clazzName?: string | undefined,
    [key: string]: unknown 
  };

  /**
   * (opcional) Nombre que se utilizará como prefijo para los eventos. Aplica solamente para el modo de operación reactivo.
   */
  @Input() onEvent?: string;

  /**
   * (opcional) Indicará si el componente que se va a cargar está definido dentro de un módulo (no es standalone). Puede ser true o 
   * señalar el nombre del módulo (en caso que difiera del nombre del componente). Requiere que el módulo donde está declarado el componente
   * implemente SuspenseableModule.
   */
  @Input() isModule?          : boolean | string;

  constructor(public suspenseCache: SuspenseCacheService<SuspenseFactoryPromise>) {}

  getClazzName(): string | undefined {
    return this.clazzName ?? this.componentParams?.clazzName;
  }

  /**
   * 
   * @param clazzName opcional, si se pasa se usa el cache
   * @returns 
   */

  fetch(clazzName?: string): SuspenseFactoryPromise {  
    if(clazzName) {
      console.log('Usando cache para clazzName: ', clazzName);
      if (!this.suspenseCache.hasClazz(clazzName)) {
        console.log('Seteando cache para clazzName: ', clazzName);
        this.suspenseCache.setClazz(clazzName, this.componentFactory);
      }       
      return this.suspenseCache.getClazz(clazzName);
    } else {
      console.log('Devolviendo componentFactory');
      return this.componentFactory;
    }
  }
}
