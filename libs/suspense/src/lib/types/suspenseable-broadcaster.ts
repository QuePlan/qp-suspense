import { ElementRef, inject, Renderer2 } from "@angular/core";
import { EventService } from "../services/event.service";
import { ISuspenseable, SuspenseableRenderer } from "./types";

export abstract class SuspenseableBroadcaster extends SuspenseableRenderer implements Pick<ISuspenseable, 'eventHandler' | 'broadcastLoad' | 'broadcastError'> {
  renderer: Renderer2    = inject(Renderer2);
  elementRef: ElementRef = inject(ElementRef);

  eventService : EventService = inject(EventService);
  eventName   ?: string;
  
  abstract eventHandler(eventName: string): void;

   broadcastLoad(): void {
    // Sólo notifica el estado en caso de  estar operando en modo "reactivo"
    console.log('[SuspenseableBroadcaster] broadcastLoad()', this.eventName);
    if (this.eventName) {        
      this.renderComponenteReady();
      this.eventService.broadcast(`${this.eventName}:load`, true);
    }
  }

  broadcastError(): void {
    // Sólo notifica el estado en caso de  estar operando en modo "reactivo"
    console.log('[SuspenseableBroadcaster] broadcastError()', this.eventName);
    if (this.eventName) {
      this.eventService.broadcast(`${this.eventName}:error`, true);
    }
  }
  
}