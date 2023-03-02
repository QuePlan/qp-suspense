import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  usersFactory = () => import('./test/test.component');
  componentParams = { origen: 'API mágica' };

  lazyInModuleFactory = () => import('./lazy-in-module/lazy-in-module.module');
  lazyInModuleParams = { whoAmI: 'I am your father!!!!' };
}
