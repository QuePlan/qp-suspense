import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DEBUG_SUSPENSE } from '@queplan/qp-suspense/types';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule, 
    AppRoutingModule
  ],
  providers: [
    {
      provide: DEBUG_SUSPENSE,
      useValue: true
    },
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
