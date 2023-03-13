import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuspenseableBroadcaster } from '@queplan/suspense';
import { tap, timer } from 'rxjs';

@Component({
  selector: 'app-lazy-standalone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lazy-standalone.component.html',
  styleUrls: ['./lazy-standalone.component.css'],
})
export class LazyStandaloneComponent extends SuspenseableBroadcaster {
  @Input() message: string;

  constructor() {
    super();
    console.log('[LazyStandaloneComponent] constructor()');
  }

  eventHandler(eventName: string): void {
    this.eventName = eventName;
  }
  ngOnInit(): void {
    timer(10000).pipe(
      tap(() => console.log('[LazyStandaloneComponent] ngOnInit() - timer(10000).pipe()')),
    ).subscribe(() => {
      console.log('[LazyStandaloneComponent] ngOnInit() - timer(10000).subscribe()', this.eventName);
      this.broadcastLoad();
    });
  }
  ngOnDestroy(): void {}

}
