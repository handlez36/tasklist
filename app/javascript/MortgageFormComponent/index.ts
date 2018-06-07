import { CommonDataService } from './../CommonDataService/commonData';
import { Component, OnInit, Inject } from '@angular/core';
import { Http } from '@angular/http';
import template from "./template.html";
import * as amortization from 'amortization';
import * as accounting from 'accounting';
import { Form, FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { CommonUtilityService } from '../CommonUtilityService/commonUtility';

@Component({
    selector: 'mortgage-form',
    template: template
})
export class MortgageFormComponent implements OnInit {
    private property_inputs: FormGroup;

    private ask: any        = 0.0;
    private price: any      = 0.0;
    private dp: any         = 0.0;
    private term: any       = 30;
    private rate: any       = 5.0;

    private monthly_payment: string;
    private total_interest: string;ang

    constructor(
        @Inject(Http) private http, 
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities)
    {
        console.log("MortgageFormComponent#constructor");
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

        this.commonData.numbers
            .subscribe( data => {
                this.price = this.utilities.formatCurrencyToString(data.price);
                this.updateMortgage(false);                
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

        this.property_inputs.controls.asking_price.setValue(this.utilities.formatCurrencyToString(this.ask));
        this.property_inputs.controls.purchase_price.setValue(this.utilities.formatCurrencyToString(this.price));
        this.property_inputs.controls.down_payment.setValue(this.utilities.formatCurrencyToString(this.dp));

        this.updateMortgage();
    }

    updateMortgage(updateCommonData = true) {
        console.log("MortgageFormComponent#updateMortgage");
        let tempPrice = 0;

        tempPrice = typeof this.price == "string" ?
            parseFloat(this.price.replace(",","")) :
            this.price

        if (tempPrice > 0) {
            
            let amortized_schedule = amortization.amortizationSchedule( tempPrice - this.dp, this.term, this.rate );
            this.monthly_payment = this.utilities.formatCurrencyToString(amortized_schedule[0].payment);
            this.total_interest = this.utilities.formatCurrencyToString(amortized_schedule.reduce( (total, amt) => total + amt.interestPayment, 0.0 ));

            console.log("Monthly payment: ", this.monthly_payment);
        }

        if(updateCommonData) {
            this.commonData.updatePropertyNumbers({
                price:              tempPrice,
                dp:                 this.dp,
                monthly_payment:    this.monthly_payment,
                mortgage_term:      this.term
            });
        }
    }    
}