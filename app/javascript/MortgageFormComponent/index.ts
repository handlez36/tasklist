import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CommonDataService } from './../CommonDataService/commonData';
import { Component, OnInit, Inject } from '@angular/core';
import { Http } from '@angular/http';
import template from "./template.html";
import * as amortization from 'amortization';
import * as accounting from 'accounting';
import { Form, FormBuilder, FormControl, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonUtilityService } from '../CommonUtilityService/commonUtility';

@Component({
    selector: 'mortgage-form',
    template: template
})
export class MortgageFormComponent implements OnInit {
    private property_inputs: FormGroup;
    private mortgageDetails: any;

    private ask: any                = 0.0;
    private price: any              = 0.0;
    private dp: any                 = 0.0;
    private term: any               = 30;
    private rate: any               = 5.0;
    private monthly_payment: any    = 0.0;
    private total_interest: any     = 0.0;

    private calculation_dependencies =
    {
        price:          ['prop_info_price'],
        down_payment:   ['down_payment_perc'],
        mortgage:       ['price', 'down_payment', 'mortgage_term', 'interest_rate', 'loan_points']
    }

    constructor(
        @Inject(Http) private http, 
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities)
    {
        console.log("MortgageFormComponent#constructor");
    }

    ngOnInit() {
        this.property_inputs = this.fb.group({});

        this.commonData.numbers
            .subscribe( data => {
                this.mortgageDetails = data;

                this.updateDownpayment();
                this.updateMortgage();
            });
    }

    // updatePrice() {
    //     if( this.calculation_dependencies['price'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
    //         if (this.price != this.utilities.getFloatFor(this.mortgageDetails.prop_info_price)) {
    //             this.price = this.utilities.getFloatFor(this.mortgageDetails.prop_info_price);
    //         }
    //     }
    // }

    updateDownpayment() {
        console.log("MortgageFormComponent#updateDownpayment");

        if( this.calculation_dependencies['down_payment'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
            let price                   = this.utilities.getFloatFor(this.mortgageDetails.price);
            let percentage              = this.utilities.getFloatFor(this.mortgageDetails.down_payment_perc);
    
            this.dp = price * (percentage / 100);
        }
    }

    updateMortgage() {
        console.log("MortgageFormComponent#updateMortgage");

        if( this.calculation_dependencies['mortgage'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
            let temp_price          = this.utilities.getFloatFor(this.mortgageDetails.price);
            let dp                  = this.utilities.getFloatFor(this.mortgageDetails.down_payment);
            let loan_points         = this.utilities.getFloatFor(this.mortgageDetails.loan_points);
            let term                = this.utilities.getFloatFor(this.mortgageDetails.mortgage_term);
            let rate                = this.utilities.getFloatFor(this.mortgageDetails.interest_rate);
            let loan_point_cost     = temp_price * (loan_points / 100);
            
            if (temp_price > 0) {
                let amortized_schedule  = amortization.amortizationSchedule( temp_price - dp - loan_point_cost, term, rate );
                this.monthly_payment    = amortized_schedule[0].payment;
                this.total_interest     = amortized_schedule.reduce( (total, amt) => total + amt.interestPayment, 0.0 )
            }
        }
    }    
}