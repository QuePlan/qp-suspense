import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Suspenseable } from '../types';

@Component({
  selector: 'app-lazy-standalone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lazy-standalone.component.html',
  styleUrls: ['./lazy-standalone.component.css'],
})
export class LazyStandaloneComponent extends Suspenseable {
  ngOnInit(): void {}
  ngOnDestroy(): void {}

}
