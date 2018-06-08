import { TextFieldComponent } from './../TextFieldComponent/index';
import { OperatingExpenseFormComponent } from './../OperatingExpenseFormComponent/index';
import { CommonUtilityService } from './../CommonUtilityService/commonUtility';
import { CommonDataService } from './../CommonDataService/commonData';
import { PropertyCostFormComponent } from './../ProjectCostComponent/index';
import { QuickPropertyInfoFormComponent } from './../PropertyInfoForms/QuickPropertyInfoForm/index';
import { MortgageFormComponent } from './../MortgageFormComponent/index';
import { Form, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import "../hello_angular/polyfills"
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { Component, NgModule } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpModule } from '@angular/http';
import * as amo from 'amortization';

import { ProfileComponent } from '../ProfileComponent/index';
import { TaskListComponent } from '../TaskListComponent/index';

var routing = [
    {
      path: "",
      component: TaskListComponent
    },
    {
      path: "test",
      component: MortgageFormComponent
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
    MortgageFormComponent,
    TaskListComponent,
    ProfileComponent,
    QuickPropertyInfoFormComponent,
    PropertyCostFormComponent,
    OperatingExpenseFormComponent,
    TextFieldComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routing)
  ],
  providers: [CommonDataService, CommonUtilityService],
  bootstrap: [AppComponent]
})
export class AppModule { }

platformBrowserDynamic().bootstrapModule(AppModule); 