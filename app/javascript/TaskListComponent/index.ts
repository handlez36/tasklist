import { CommonDataService } from './../CommonDataService/commonData';
import { amortizationSchedule } from 'amortization/index';
import { Component, OnInit, Input, EventEmitter, Output, Inject } from '@angular/core';
import { Http } from '@angular/http';
import template from "./template.html";
import 'rxjs/add/operator/map';
import * as amortization from 'amortization';
import * as accounting from 'accounting';
import { Form, FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'task-list',
    template: template
})
export class TaskListComponent implements OnInit {
    // @Output() mortgageDetails = new EventEmitter();
    private mortgageDetails: any;

    constructor(private fb: FormBuilder, @Inject(CommonDataService) private commonData) {
        console.log("TaskListComponent#constructor");
    }

    ngOnInit() { 
        this.mortgageDetails = { price: 40.00, dp: 10.00, monthly_payment: 100.00 } 

        this.commonData.numbers
            .subscribe( data => this.mortgageDetails = data );
    }

    updateMortgageDetails(event) {
        // this.mortgageDetails.emit(event);
        this.mortgageDetails = event;
    }
}