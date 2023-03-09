import { Component, Input, NgModule } from '@angular/core';
import { Suspenseable } from '@queplan/suspense';
import { HttpClient } from '@angular/common/http';
import { tap, delay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test',
  template: `
    <h4>Users {{origen}}</h4>

    <ul>
      <li *ngFor="let user of users">{{ user.name }}</li>
    </ul>
  `,
})
export default class TestComponent extends Suspenseable {
  
  @Input() origen: string;
  users = [];
  constructor(private http: HttpClient) {
    super();
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {}

  setup() {
    return this.http
      .get<any[]>('https://jsonplaceholder.typicode.com/users')
      .pipe(
        delay(2000),
        tap((users) => (this.users = users))
      );
  }
}

@NgModule({
  declarations: [TestComponent],
  imports: [CommonModule],
})
export class TestModule {}
