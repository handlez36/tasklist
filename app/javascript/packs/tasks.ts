import "../hello_angular/polyfills"
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { Component, NgModule } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

// var routing = [
//     {
//         path: "",
//         component: AppComponent
//     }
// ]

@Component({
  selector: 'tasks',
  template: "<router-outlet></router-outlet>"
})
class AppComponent { }

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([{path: "", component: AppComponent}])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);