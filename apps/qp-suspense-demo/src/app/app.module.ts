import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorViewDirective, DefaultViewDirective, FallbackViewDirective } from '@queplan/qp-suspense/directives';
import { SuspenseComponent } from '@queplan/qp-suspense';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule, 
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [ AppComponent ],
})
export class AppModule {}
