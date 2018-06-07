import { CommonUtilityService } from './../CommonUtilityService/commonUtility';
import { Component, OnInit, Inject, Input } from '@angular/core';
import { Http } from '@angular/http';
import template from "./template.html";
import 'rxjs/add/operator/map';
import * as amortization from 'amortization';
import * as accounting from 'accounting';
import { Form, FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { CommonDataService } from '../CommonDataService/commonData';

@Component({
    selector: 'prop-cost-form',
    template: template
})
export class PropertyCostFormComponent implements OnInit {
    private mortgageDetails: any;
    private mDetails: any;
    private property_inputs: FormGroup;

    private closing_costs: number;
    private estimated_repairs: number;
    private pre_rent_holding: number;
    private loan_points: number;
            
    private use_closing_cost_perc: boolean;
    private use_repair_perc: boolean;

    private repair_paint_carpet: number;
    private repair_foundation: number;
    private repair_roof: number;
    private repair_ac: number;

    constructor(
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities) {
        console.log("PropertyCostFormComponent#constructor");

        this.use_closing_cost_perc = false;
        this.use_repair_perc = false;
    }

    ngOnInit() {
        var decRequirement: RegExp = new RegExp('[\\d\\.]+');
        var numRequirement: RegExp = new RegExp('[\\d\\.]+');
        
        this.property_inputs = this.fb.group({
            pre_rent_holding:               ["0", Validators.pattern(numRequirement) ],
            repair_paint_carpet:            ["0.00", Validators.pattern(decRequirement) ],
            repair_ac:                      ["0.00", Validators.pattern(decRequirement) ],
            repair_foundation:              ["0.00", Validators.pattern(decRequirement) ],
            repair_roof:                    ["0.00", Validators.pattern(decRequirement) ],
            use_repair_perc_control:        [false ],
            use_closing_cost_perc_control:  [false]
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

    toggle_use_percentage(for_what) {
        this.formControls().use_repair_perc_control == "Yes" ?
            this.use_repair_perc = true :
            this.use_repair_perc = false;

        this.formControls().use_closing_cost_perc_control == "Yes" ?
            this.use_closing_cost_perc = true :
            this.use_closing_cost_perc = false;
    }

    updateInputFormat() {
        this.closing_costs   = parseFloat( this.formControls().closing_costs.replace(",","") )  || 0;
        this.estimated_repairs      = parseFloat( this.formControls().estimated_repairs.replace(",","") )    || 0;
        this.pre_rent_holding      = parseFloat( this.formControls().pre_rent_holding.replace(",","") )    || 0;
        this.loan_points    = parseInt ( this.formControls().loan_points )    || 0;

        this.property_inputs.controls.asking_price.setValue(accounting.formatMoney(this.closing_costs).replace("$",""));
        this.property_inputs.controls.purchase_price.setValue(accounting.formatMoney(this.estimated_repairs).replace("$",""));
        this.property_inputs.controls.purchase_price.setValue(accounting.formatMoney(this.pre_rent_holding).replace("$",""));
    }
}