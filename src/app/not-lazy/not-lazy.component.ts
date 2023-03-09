import { Component, Input } from '@angular/core';
import { tap, timer } from 'rxjs';
import { useSuspense, SuspenseableClassic } from '@queplan/suspense';

@Component({
  selector: 'app-not-lazy',
  templateUrl: './not-lazy.component.html',
  styleUrls: ['./not-lazy.component.scss'],
  providers: [useSuspense(NotLazyComponent)],
})
export class NotLazyComponent extends SuspenseableClassic  {
  @Input() saludo: string;
  ngOnInit(): void {}
  ngOnDestroy(): void {}
  setup() {
    return timer(3000).pipe(
      tap(() => console.log('NotLazyComponent 3000'))
    );
  }
}
