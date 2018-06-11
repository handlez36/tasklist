import { ProfileComponent } from './../ProfileComponent/index';
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
    private cost_of_purchase_form: FormGroup;

    private conditions: any;
    private condition_keys: any;

    private pre_rent_holding: number;
    private estimated_repairs: any;

    private price: number;
    private closing_cost: number                = 0.0;
    private closing_cost_perc: number           = 0;
    private pre_rent_holding_cost: number       = 0.0;
    private loan_point_cost: number             = 0.0;
    private estimated_paint: number;
    private estimated_foundation: number;
    private estimated_roof: number;
    private estimated_ac: number;
    
    private loan_points: number;
            
    private use_closing_cost_perc: boolean;
    private use_repair_perc: boolean;

    private repair_house_condition: string;
    private repair_paint_carpet: number = 0.0;
    private repair_foundation: number;
    private repair_roof: number;
    private repair_ac: number;

    constructor(
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities) 
    {
        console.log("PropertyCostFormComponent#constructor");

        this.use_closing_cost_perc = false;
        this.use_repair_perc = false;

        this.conditions =
        {
            '-Custom-': 0.00,
            'Great':    5.00,
            'Good':     10.00,
            'Bad':      20.00
        }
        this.condition_keys = Object.keys(this.conditions);
        this.repair_house_condition = "-Custom-";
    }

    ngOnInit() {
        this.cost_of_purchase_form = this.fb.group({});

        this.commonData.numbers
            .subscribe( data => {
                this.mortgageDetails = data;
                
                this.updateClosingCostField();
                this.updateEstimatedRepairCost(false);
                this.updatePropertyConditionDropdown();
                this.updateLoanPointCost();
            });
    }

    updateClosingCosts(data) {
        console.log("ProjectCostComponent#updateClosingCosts");

        let price = typeof this.mortgageDetails.price == "string" ?
            parseFloat( this.mortgageDetails.price.replace(",","") ) :
            this.mortgageDetails.price;

        if (price && price > 0)
        {
            let percentage = data / 100;
            this.closing_cost = price * percentage;
        }
        // debugger;
    }

    updatePreRentHoldingCosts(data) {
        console.log("ProjectCostComponent#updatePreRentHoldingCosts");

        let monthly_rent        = this.utilities.getFloatFor(this.mortgageDetails, "monthly_rent");
        let holding_months      = this.utilities.getIntFor(this.mortgageDetails, "pre_rent_holding_months")

        if (monthly_rent && holding_months) {
            this.pre_rent_holding_cost = monthly_rent * holding_months;
        }
    }

    updatePropertyConditionDropdown() {
        let property_size           = this.mortgageDetails.property_size;
        let multiplier              = this.conditions[this.mortgageDetails.repair_house_condition];
        let condition_match_flag    = false;

        this.condition_keys.forEach( condition => {
            if ( this.mortgageDetails.repair_paint_carpet && 
                (this.mortgageDetails.repair_paint_carpet == property_size * multiplier) ) 
            {
                condition_match_flag = true;
                this.repair_house_condition = condition;
            }
            if (!condition_match_flag) { this.repair_house_condition = "-Custom-"}
        })
    }

    updateClosingCostField() {
        let price = typeof this.mortgageDetails.price  == "string" ?
            parseFloat( this.mortgageDetails.price.replace(",","") ) :
            this.mortgageDetails.price

        let perc = typeof this.mortgageDetails.closing_cost_perc  == "string" ?
            parseFloat( this.mortgageDetails.closing_cost_perc ) :
            this.mortgageDetails.closing_cost_perc

        let closing_costs = typeof this.mortgageDetails.closing_cost  == "string" ?
            parseFloat( this.mortgageDetails.closing_cost ) :
            this.mortgageDetails.closing_cost

        if ( (price && perc && closing_costs) &&
             price * (perc/100)  != closing_costs) {
            this.closing_cost_perc = (closing_costs / price) * 100;
        }
    }

    updatePaintCarpetEstimateCost(event) {
        console.log("ProjectCostComponent#updatePaintCarpetEstimateCost");
        
        if (event != "-Custom-") {
            let property_size   = this.mortgageDetails.property_size;
            let multiplier      = this.conditions[this.mortgageDetails.repair_house_condition];
            
            this.repair_paint_carpet = property_size * multiplier;
        }
    }

    updateEstimatedRepairCost(updateCommonData = true) {
        console.log("ProjectCostComponent#updateEstimatedRepairCost");

        this.estimated_repairs = 
            ( parseFloat( this.mortgageDetails.repair_paint_carpet ) || 0.00 ) +
            ( parseFloat( this.mortgageDetails.repair_foundation ) || 0.00 ) +
            ( parseFloat( this.mortgageDetails.repair_roof ) || 0.00 ) +
            ( parseFloat( this.mortgageDetails.repair_ac ) || 0.00 )

        this.estimated_repairs = this.utilities.formatCurrencyToString(this.estimated_repairs);
    }

    updateLoanPointCost() {
        console.log("ProjectCostComponent#updateLoanPointCost");

        let points      = this.utilities.getIntFor( this.mortgageDetails, "loan_points");
        let price       = this.utilities.getFloatFor( this.mortgageDetails, "price" );
        let dp          = this.utilities.getFloatFor( this.mortgageDetails, "down_payment" );
        let points_cost = this.utilities.getFloatFor( this.mortgageDetails, "loan_point_cost");

        if ( (points >= 0 && price >= 0 && dp >= 0) &&
              points_cost != (points / 100) * (price - dp) ) 
        {
            this.loan_point_cost = (points / 100) * (price - dp);
        }
    }
}