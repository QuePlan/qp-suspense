import { Component, Input } from '@angular/core';

import { timer } from 'rxjs';
import { SuspenseableClassic, useSuspense } from '@queplan/qp-suspense/types';

@Component({
  selector: 'app-not-lazy2',
  templateUrl: './not-lazy2.component.html',
  styleUrls: ['./not-lazy2.component.scss'],
  providers: [ useSuspense(NotLazy2Component) ],
})
export class NotLazy2Component extends SuspenseableClassic {
  @Input() saludos: string;
  ngOnInit(): void {}
  ngOnDestroy(): void {}
  setup() {
    return timer(5000);
  }
}
