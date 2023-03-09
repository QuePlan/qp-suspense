import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

type listenerFunction = (params?) => any;
@Injectable({
  providedIn: 'root'
})
export class EventService {

  listeners: Map<string, Array<listenerFunction>>;
  eventsSubject: Subject<any>;
  events: Observable<any>;

  constructor() {
      this.listeners = new Map();
      this.eventsSubject = new Subject();

      this.events = this.eventsSubject.asObservable();

      this.events.subscribe(
          ({name, args}) => {
              if (this.listeners.has(name)) {
                  for (const listener of this.listeners.get(name)) {
                      listener(...args);
                  }
              }
          });
  }

  on(name: string, listener: any) {
      if (!this.listeners.has(name)) {
          this.listeners.set(name, []);
      }

      this.listeners.get(name).push(listener);
  }

  off(name: string) {
    if (this.listeners.has(name)) {
      this.listeners.delete(name);
    }
  }

  broadcast(name: string, ...args: any[]) {
      this.eventsSubject.next({
          name,
          args
      });
  }
}
