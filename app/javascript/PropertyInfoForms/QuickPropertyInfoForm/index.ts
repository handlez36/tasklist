import { CommonUtilityService } from './../../CommonUtilityService/commonUtility';
import { CommonDataService } from './../../CommonDataService/commonData';
import { Component, OnInit, Inject } from '@angular/core';
import { Http } from '@angular/http';
import template from "./template.html";
import 'rxjs/add/operator/map';
import * as amortization from 'amortization';
import * as accounting from 'accounting';
import { Form, FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'quick-prop-form',
    template: template
})
export class QuickPropertyInfoFormComponent implements OnInit {
    private mortgageDetails: object;
    private property_inputs: FormGroup;

    private price: number;
    private rent: number;
    private size: number;

    constructor(
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities) 
    {
        console.log("QuickPropertyInfoFormComponent#constructor");
    }

    ngOnInit() {
        var decRequirement: RegExp = new RegExp('[\\d\\.]+');
        var numRequirement: RegExp = new RegExp('[\\d\\.]+');
        
        this.property_inputs = this.fb.group({
            asking_price:       ["0.00", Validators.pattern(decRequirement) ],
            monthly_rent:       ["0.00", Validators.pattern(decRequirement) ],
            property_size:      ["0", Validators.pattern(decRequirement) ]
        });

        this.commonData.numbers
        .subscribe( data => {
            data.price = this.utilities.formatCurrencyToString(data.price);
            data.dp = this.utilities.formatCurrencyToString(data.dp);
            data.monthly_payment = this.utilities.formatCurrencyToString(data.monthly_payment);

            this.mortgageDetails = data;
        });
    }

    formControls() {
        return this.property_inputs.value;
    }

    updateInputFormat() {
        this.price   = parseFloat( this.formControls().asking_price.replace(",","") )  || 0;
        this.rent      = parseFloat( this.formControls().monthly_rent.replace(",","") )    || 0;
        this.size    = parseInt ( this.formControls().property_size )    || 0;

        this.property_inputs.controls.asking_price.setValue(this.utilities.formatCurrencyToString(this.price));
        this.property_inputs.controls.monthly_rent.setValue(this.utilities.formatCurrencyToString(this.rent));

        this.commonData.updatePropertyNumbers({
            price:              this.price,
            monnthly_rent:      this.rent,
            property_size:      this.size
        });
    }
}