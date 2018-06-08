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
    private property_inputs: FormGroup;

    private pre_rent_holding: number;
    private estimated_repairs: any;

    private price: number;
    private closing_costs: number;
    private pre_rent_holding_costs: number      = 0.0;
    private estimated_paint: number;
    private estimated_foundation: number;
    private estimated_roof: number;
    private estimated_ac: number;
    
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
            closing_cost:                   ["0.00", Validators.pattern(decRequirement) ],
            closing_cost_perc:              ["0.00", Validators.pattern(decRequirement) ],
            use_closing_cost_perc_control:  [false]
        });

        this.commonData.numbers
            .subscribe( data => {
                // data.price = this.utilities.formatCurrencyToString(data.price);
                // data.dp = this.utilities.formatCurrencyToString(data.dp);
                // data.monthly_payment = this.utilities.formatCurrencyToString(data.monthly_payment);
                this.mortgageDetails = data;
                
                this.updateClosingCosts(false);
                this.updatePreRentHoldingCosts(false);
                this.updateEstimatedRepairCost(false);
            });
    }

    updateClosingCosts(updateCommonData = true) {
        console.log("ProjectCostComponent#updateClosingCosts");

        let price = this.utilities.getFloatFor(this.mortgageDetails, "price");
        let closing_cost = 0;

        if(this.use_closing_cost_perc) {
            let closing_cost_perc = parseFloat( this.formControls().closing_cost_perc ) / 100;
            closing_cost = price * closing_cost_perc;
            
            this.property_inputs.controls.closing_cost.setValue(this.utilities.formatCurrencyToString(closing_cost));
        }
        this.updateInputFormat();
        
        if (updateCommonData) { 
            this.updateCommonData({ closing_cost: closing_cost }) 
        }
    }

    updatePreRentHoldingCosts(updateCommonData = true) {
        console.log("ProjectCostComponent#updatePreRentHoldingCosts");

        let monthly_rent = this.utilities.getFloatFor(this.mortgageDetails, "monthly_rent");
        let pre_rent_holding_length = parseInt(this.formControls().pre_rent_holding);
        let cost = 0;

        if(pre_rent_holding_length) {
            cost = monthly_rent * pre_rent_holding_length;
            // this.property_inputs.controls.pre_rent_holding_cost.setValue(this.utilities.formatCurrencyToString(cost));
            this.pre_rent_holding_costs = this.utilities.formatCurrencyToString(cost);
        }
        this.updateInputFormat();
        if (updateCommonData) { 
            this.updateCommonData({ pre_rent_holding_cost: cost }) 
        }
    }

    

    updateEstimatedRepairCost(updateCommonData = true) {
        console.log("ProjectCostComponent#updateEstimatedRepairCost");

        let paint_carpet            = parseFloat( this.formControls().repair_paint_carpet );
        let foundation              = parseFloat( this.formControls().repair_foundation );
        let roof                    = parseFloat( this.formControls().repair_roof );
        let ac                      = parseFloat( this.formControls().repair_ac );

        console.log("Paint: " + paint_carpet + "; foundation: " + foundation + "; roof: " + roof + "; ac: " + ac);
        this.estimated_repairs      = this.utilities.formatCurrencyToString(paint_carpet + foundation + roof + ac)

        this.updateInputFormat();
        if (updateCommonData) { 
            this.updateCommonData({
                 repair_paint_carpet:   paint_carpet,
                 repair_foundation:     foundation,
                 repair_roof:           roof,
                 repair_ac:             ac
            }) 
        }
    }

    formControls() {
        return this.property_inputs.value;
    }

    toggle_use_percentage(for_what) {
        console.log("Use percentage for closing costs: ", this.formControls().use_closing_cost_perc_control);
        console.log("Use percentage for repair costs: ", this.formControls().use_repair_perc_control);

        this.formControls().use_repair_perc_control == "Yes" ?
            this.use_repair_perc = true :
            this.use_repair_perc = false;

        this.formControls().use_closing_cost_perc_control == "Yes" ?
            this.use_closing_cost_perc = true :
            this.use_closing_cost_perc = false;
    }

    updateInputFormat() {
        let cc              = this.formControls().closing_cost;
        let paint           = this.formControls().repair_paint_carpet;
        let foundation      = this.formControls().repair_foundation;
        let roof            = this.formControls().repair_roof;
        let ac              = this.formControls().repair_ac;

        this.property_inputs.controls.closing_cost.setValue(accounting.formatMoney(cc).replace("$",""));
        this.property_inputs.controls.repair_paint_carpet.setValue(accounting.formatMoney(paint).replace("$",""));
        this.property_inputs.controls.repair_foundation.setValue(accounting.formatMoney(foundation).replace("$",""));
        this.property_inputs.controls.repair_roof.setValue(accounting.formatMoney(roof).replace("$",""));
        this.property_inputs.controls.repair_ac.setValue(accounting.formatMoney(ac).replace("$",""));
    }

    updateCommonData(cost_of_purchase) {
        this.commonData.updatePropertyNumbers(cost_of_purchase);
    }
}