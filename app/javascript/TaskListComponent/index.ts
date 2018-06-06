import { amortizationSchedule } from 'amortization/index';
import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import template from "./template.html";
import 'rxjs/add/operator/map';
import * as amortization from 'amortization';
import * as accounting from 'accounting';
import { Form, FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
    selector: 'task-list',
    template: template
})
export class TaskListComponent implements OnInit {
    private baseUrl:string      = "";
    private categories:object   = null;
    private property_inputs: FormGroup;

    private ask: number;
    private price: number;
    private dp: number;
    private term: number;
    private rate: number;

    private monthly_payment: string;
    private total_interest: string;

    constructor(private http: Http, private fb: FormBuilder) {
        console.log("TaskListComponent#constructor");
        this.baseUrl = "/categories.json";
    }

    ngOnInit() {
        var decRequirement: RegExp = new RegExp('[\\d\\.]+');
        var numRequirement: RegExp = new RegExp('[\\d\\.]+');
        
        this.property_inputs = this.fb.group({
            asking_price:       ["0.00", Validators.pattern(decRequirement) ],
            purchase_price:     ["0.00", Validators.pattern(decRequirement) ],
            down_payment:       ["0.00", Validators.pattern(decRequirement) ],
            mortgage_term:      ["30", Validators.pattern(numRequirement) ],
            interest_rate:      ["5.0", Validators.pattern(decRequirement) ]
        });
    }

    formControls() {
        return this.property_inputs.value;
    }

    updateInputFormat() {
        this.ask     = parseFloat( this.formControls().asking_price.replace(",","") )    || 0
        this.price   = parseFloat( this.formControls().purchase_price.replace(",","") )  || 0;
        this.dp      = parseFloat( this.formControls().down_payment.replace(",","") )    || 0;
        this.term    = parseInt ( this.formControls().mortgage_term )    || 30;
        this.rate    = parseFloat( this.formControls().interest_rate )   || 0;

        this.property_inputs.controls.asking_price.setValue(accounting.formatMoney(this.ask).replace("$",""));
        this.property_inputs.controls.purchase_price.setValue(accounting.formatMoney(this.price).replace("$",""));
        this.property_inputs.controls.down_payment.setValue(accounting.formatMoney(this.dp).replace("$",""));

        this.updateMortgage();
    }

    updateMortgage() {
        if (this.price > 0) {
            let amortized_schedule = amortization.amortizationSchedule( this.price - this.dp, this.term, this.rate );
            this.monthly_payment = accounting.formatMoney(amortized_schedule[0].payment);
            this.total_interest = accounting.formatMoney(amortized_schedule.reduce( (total, amt) => total + amt.interestPayment, 0.0 ));
        }

    }
}