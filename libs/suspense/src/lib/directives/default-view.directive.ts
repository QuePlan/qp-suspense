import { Directive, Input } from '@angular/core';
import { SuspenseCacheService } from '../services';
import { SuspenseFactoryPromise } from '../types/types';

/**
 * Directiva que define el área donde se va a incluir el componente de tipo Suspenseable.
 * IMPORTANTE: Es opcional definir el nombre de la clase del componente. De hacerlo se debe usar el 
 *             @Input() clazzName ó bien indicar el valor como un atributo 'clazzName' dentro del objeto 
 *             @Input() componentParams
 */
@Directive({
  selector  : '[defaultView]',
  standalone: true,
  providers : [ SuspenseCacheService ]
})
export class DefaultViewDirective {
  // Ref: https://medium.com/javascript-everyday/tip-20-prefetch-lazy-loaded-component-fc04abb6eb87
  // defer(() => import(/* webpackPrefetch: true | <number> */'<lib>').then( ({ [ComponentClass] }) => ComponentClass ))

  /**
   * Constructor/Factory para el componente a cargar. Comparte el nombre de la directiva, por lo que se
   * se asigna como parámetro. 
   * `[defaultView]="componentFactory"`
   */
  @Input('defaultView') componentFactory!: SuspenseFactoryPromise;  

  /**
   * (opcional) Nombre de la clase asociada al componente a cargar.
   * IMPORTANTE: Su opcionalidad está condicionada a que el valor de clazzName 
   *             pueda haberse definido previamente dentro del @Input() componentParams
   */
  @Input() clazzName?         : string;

  /**
   * (opcional) Objeto con los parámetros del Componente, que están definidos como sus @Input()
   * IMPORTANTE: Es opcional (caso que no haya @Input()), pero clazzName debe estar definido aquí ó
   *             en el @Input() clazzName
   */
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

  /**
   * Constructor de la directiva.
   * @param suspenseCache Servicio que se encargará de almacenar los componentes que se hayan cargado previamente.
   */
  constructor(public suspenseCache: SuspenseCacheService<SuspenseFactoryPromise>) {}

  /**
   * Rescata el nombre de la clase que eventualmente pudiera haberse entregado como parámetro del componente.
   * @returns {string | undefined} Nombre de la clase del componente a cargar
   */
  getClazzName(): string | undefined {
    return this.clazzName ?? this.componentParams?.clazzName;
  }

  /**
   * La función fetch() se encargará de realizar la petición hacia el código del componente a cargar.
   * Si se ha especificado el nombre de la clase del componente, se utilizará el cache para evitar realizar
   * la petición nuevamente.
   * @param clazzName opcional, en caso de pasarlo como parámetro se usará el cache
   * @returns {SuspenseFactoryPromise} Promise que devuelve el componente a cargar
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
