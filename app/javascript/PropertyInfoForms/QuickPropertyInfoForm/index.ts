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

    private month_names: any;
    private month_vals:     any;
    private years: any;

    constructor(
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities) 
    {
        console.log("QuickPropertyInfoFormComponent#constructor");

        this.month_names = 
        [
            "Jan", "Feb", "Mar", "Apr",
            "May", "June", "July", "Aug",
            "Sept", "Oct", "Nov", "Dec"
        ]
        this.month_vals = 
        [
            0,1,2,3,
            4,5,6,7,
            8,9,10,11
        ]
        this.years = 
        [
            2018, 2019, 2020, 2021, 2022, 2023, 2024
        ]
    }

    ngOnInit() {
        var decRequirement: RegExp = new RegExp('[\\d\\.]+');
        var numRequirement: RegExp = new RegExp('[\\d\\.]+');
        
        this.property_inputs = this.fb.group({
            asking_price:       ["0.00", Validators.pattern(decRequirement) ],
            monthly_rent:       ["0.00", Validators.pattern(decRequirement) ],
            property_size:      ["0", Validators.pattern(decRequirement) ],
            purchase_month:     [0],
            purchase_year:      [2018]
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
            monthly_rent:      this.rent,
            property_size:      this.size
        });
    }
}