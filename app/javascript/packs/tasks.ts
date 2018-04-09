import "../hello_angular/polyfills"
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { Component, NgModule } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpModule } from '@angular/http';

import { ProfileComponent } from '../ProfileComponent/index';
import { TaskListComponent } from '../TaskListComponent/index';

var routing = [
    {
        path: "",
        component: TaskListComponent
    }
]

@Component({
  selector: 'tasks',
  template: "<router-outlet></router-outlet>"
})
class AppComponent { }

@NgModule({
  declarations: [
    AppComponent,
    TaskListComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    RouterModule.forRoot(routing)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule);