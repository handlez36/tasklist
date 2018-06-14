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
    private estimated_repairs: any;
    private closing_cost: number                = 0.0;
    private closing_cost_perc: number           = 0;
    private pre_rent_holding_cost: number       = 0.0;
    private loan_point_cost: number             = 0.0;
    private repair_paint_carpet: number = 0.0;
    private repair_house_condition: string;
    private calculation_dependencies: any;

    constructor(
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities) 
    {
        console.log("PropertyCostFormComponent#constructor");

        this.conditions =
        {
            '-Custom-': 0.00,
            'Great':    5.00,
            'Good':     10.00,
            'Bad':      20.00
        }
        this.condition_keys = Object.keys(this.conditions);
        this.repair_house_condition = "-Custom-";

        this.calculation_dependencies =
        {
            closing_cost:               ['price', 'closing_cost_perc'],
            pre_rent_holding_cost:      ['pre_rent_holding_months','monthly_rent'],
            paint_carpet_repair_cost:   ['repair_house_condition','property_size'],
            total_repair_cost:          ['repair_paint_carpet', 'repair_house_condition', 'repair_foundation', 'repair_roof','repair_ac'],
            loan_point_cost:            ['loan_points','price','down_payment']
        }
    }

    ngOnInit() {
        this.cost_of_purchase_form = this.fb.group({});

        this.commonData.numbers
            .subscribe( data => {
                this.mortgageDetails = data;
                
                this.updateClosingCosts();
                this.updatePreRentHoldingCosts();
                this.updateEstimatedRepairCost(false);
                this.updateLoanPointCost();
            });
    }

    updateClosingCosts() {
        console.log("ProjectCostComponent#updateClosingCosts");

        if( this.calculation_dependencies['closing_cost'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
            let temp_price = this.utilities.getFloatFor( this.mortgageDetails.price );
            let percentage = this.utilities.getFloatFor( this.mortgageDetails.closing_cost_perc) / 100.0;

            if((percentage && percentage > 0) && 
               (temp_price && temp_price > 0)) 
            {
                this.closing_cost = temp_price * percentage;    
            }
        }
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

    updatePreRentHoldingCosts() {
        console.log("ProjectCostComponent#updatePreRentHoldingCosts");

        if( this.calculation_dependencies['pre_rent_holding_cost'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
        }

        let monthly_rent        = this.utilities.getFloatFor(this.mortgageDetails.monthly_rent);
        let holding_months      = this.utilities.getIntFor(this.mortgageDetails.pre_rent_holding_months);

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

    updatePaintCarpetEstimateCost(event) {
        console.log("ProjectCostComponent#updatePaintCarpetEstimateCost");
        
        if( this.calculation_dependencies['paint_carpet_repair_cost'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
            if (event != "-Custom-") {
                let property_size   = this.utilities.getIntFor(this.mortgageDetails.property_size);
                let multiplier      = this.conditions[this.mortgageDetails.repair_house_condition];
                
                this.repair_paint_carpet = property_size * multiplier;
            }
        }
    }

    updateEstimatedRepairCost(updateCommonData = true) {
        console.log("ProjectCostComponent#updateEstimatedRepairCost");

        if( this.calculation_dependencies['total_repair_cost'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
            this.estimated_repairs = 
                ( this.utilities.getFloatFor(this.mortgageDetails.repair_paint_carpet) ) +
                ( this.utilities.getFloatFor(this.mortgageDetails.repair_foundation) ) +
                ( this.utilities.getFloatFor(this.mortgageDetails.repair_roof) ) +
                ( this.utilities.getFloatFor(this.mortgageDetails.repair_ac) )
        }
    }

    updateLoanPointCost() {
        console.log("ProjectCostComponent#updateLoanPointCost");

        if( this.calculation_dependencies['loan_point_cost'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
            let points      = this.utilities.getIntFor( this.mortgageDetails.loan_points);
            let price       = this.utilities.getFloatFor( this.mortgageDetails.price);
            let dp          = this.utilities.getFloatFor( this.mortgageDetails.down_payment );
    
            if ( points >= 0 && price >= 0 && dp >= 0 ) 
            {
                this.loan_point_cost = (points / 100) * (price - dp);
            }
        }
    }
}