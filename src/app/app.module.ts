import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SuspenseComponent, ErrorViewDirective, DefaultViewDirective, FallbackViewDirective } from '@queplan/suspense';
import { NotLazyComponent } from './not-lazy/not-lazy.component';
import { NotLazy2Component } from './not-lazy2/not-lazy2.component';
import { NotLazyEventdrivenComponent } from './not-lazy-eventdriven/not-lazy-eventdriven.component';
import { TestSuspenseableComponent } from './test-suspenseable/test-suspenseable.component';

@NgModule({
  declarations: [
    AppComponent,
    NotLazyComponent,
    NotLazy2Component,
    NotLazyEventdrivenComponent,
    TestSuspenseableComponent,
  ],
  imports: [
    BrowserModule, 
    AppRoutingModule, 
    HttpClientModule, 
    SuspenseComponent,
    DefaultViewDirective,
    FallbackViewDirective,
    ErrorViewDirective
  ],
  providers: [],
  bootstrap: [ AppComponent ],
})
export class AppModule {}
