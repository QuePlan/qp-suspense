import { inject } from "@angular/core";
import { takeUntil, combineLatest, filter, tap, map } from "rxjs";
import { EventService } from "../services/event.service";
import { ISuspenseable } from "./types";

export abstract class SuspenseableBroadcaster implements Pick<ISuspenseable, 'eventHandler' | 'broadcastLoad' | 'broadcastError'> {
  eventService : EventService = inject(EventService);
  eventName   ?: string;
  initialized = false;
  
  abstract eventHandler(eventName: string): void;

   broadcastLoad(): void {
    // Sólo notifica el estado en caso de  estar operando en modo "reactivo"
    if (this.eventName) {      
      this.eventService.broadcast(`${this.eventName}:load`, true);
    }
  }

  broadcastError(): void {
    // Sólo notifica el estado en caso de  estar operando en modo "reactivo"
    if (this.eventName) {
      this.eventService.broadcast(`${this.eventName}:error`, true);
    }
  }
  
}