import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

/**
 * Tipo de dato para definir la función que se ejecutará cuando se dispare un evento.
 */
type listenerFunction = (params?: any) => any;

/**
 * Servicio que permite emitir eventos y suscribirse a ellos.
 * Una implementación bastante básica del modelo CQRS (Command Query Responsibility Segregation), patrón Observer,
 * o incluso del modelo de eventos de Angular que utiliza "señales".
 */
@Injectable({
  providedIn: 'root'
})
export class EventService {

  /**
   * Mapa que contiene los eventos y sus suscriptores.
   */
  listeners: Map<string, Array<listenerFunction>>;

  /**
   * Subject que permite emitir eventos.
   */
  eventsSubject: Subject<any>;

  /**
   * Observable que permite suscribirse a los eventos.
   */
  events: Observable<any>;

  /**
   * Constructor del servicio. Se encargará de inicializar las variables y de generar el observable que permitirá suscribirse a los eventos
   * y la ejecución de las funciones de callback que se hayan definido para cada evento.
   */
  constructor() {
      this.listeners = new Map();
      this.eventsSubject = new Subject();

      this.events = this.eventsSubject.asObservable();

      /**
       * Suscripción encargada de iterar sobre las funciones de callback definidas para cada evento y ejecutarlas.
       */
      this.events.subscribe(
        ({ name, args }) => {
          if (this.listeners.has(name)) {
            for (const listener of this.listeners.get(name) ?? []) {
              listener(...args);
            }
          }
        }
      );
  }

  /**
   * Le indica al servicio que registre un evento con el nombre dado, de modo de poder capturarlo cuando este se "dispare".
   * @param name {string} Nombre del evento.
   * @param listener {listenerFunction} Función que se ejecutará cuando se dispare el evento.
   */
  on(name: string, listener: any) {
    /**
     * Si no hay eventos registrados, se inicializa el arreglo de eventos para ese nombre.
     */
    if (!this.listeners.has(name)) {
      this.listeners.set(name, []);
    }

    /**
     * Agrega el evento al arreglo de eventos para el nombre indicado.
     */
    this.listeners?.get(name)?.push(listener);
  }

  /**
   * Elimina el evento identificado por "name" del mapa de evento registrados.
   * Es útil cuando no se requiere persistir "para siempre" el evento en cuestión, de modo de poder 
   * asegurarse la consistencia de las llamadas del callback dentro de la aplicación.
   * @param name {string} Nombre del evento.
   */
  off(name: string) {
    if (this.listeners.has(name)) {
      this.listeners.delete(name);
    }
  }

  /**
   * Informa al servicio que se ha "disparado" un evento, de modo de que pueda ejecutar las funciones de callback.
   * El subscribe del constructor se encargará de la ejecución de las funciones de callback.
   * @param name {string} Nombre del evento.
   * @param args {any[]} Argumentos que se pasarán a la función de callback.
   */
  broadcast(name: string, ...args: any[]) {
      this.eventsSubject.next({
          name,
          args
      });
  }
}
