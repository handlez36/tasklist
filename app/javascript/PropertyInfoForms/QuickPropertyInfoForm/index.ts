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
    private mortgageDetails: any;
    private property_inputs: FormGroup;

    private price: number           = 0.0;
    private rent: number            = 0.0;
    private size: number            = 0.0;

    private month_names: any;
    private month_vals: any;
    private years: any;

    private calculation_dependencies: any;

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

        this.calculation_dependencies =
        {
            price: ['price']
        }
    }

    ngOnInit() {
        
        this.property_inputs = this.fb.group({});

        this.commonData.numbers
            .subscribe( data => {
                this.mortgageDetails = data;

                this.updatePrice();
            });
    }

    updatePrice() {
        if( this.calculation_dependencies['price'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
            if (this.price != this.utilities.getFloatFor(this.mortgageDetails.price)) {
                this.price = this.utilities.getFloatFor(this.mortgageDetails.price);
            }
        }
    }
}