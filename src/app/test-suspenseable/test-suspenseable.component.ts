import { Component } from '@angular/core';
import { Suspenseable } from '@queplan/suspense';

@Component({
  selector: 'app-test-suspenseable',
  templateUrl: './test-suspenseable.component.html',
  styleUrls: ['./test-suspenseable.component.scss']
})
export class TestSuspenseableComponent extends Suspenseable {
  ngOnInit(): void {}
  ngOnDestroy(): void {}

  eventHandler(eventName: string): void {
    this.eventName = eventName;
  }

}
