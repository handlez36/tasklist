import { CommonUtilityService } from './../CommonUtilityService/commonUtility';
import { CommonDataService } from './../CommonDataService/commonData';
import { Component, OnInit, Inject } from '@angular/core';
import template from "./template.html";
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'operating-expenses-form',
    template: template
})
export class OperatingExpenseFormComponent implements OnInit {
    private property_inputs:    FormGroup;
    private mortgageDetails:    any;

    private vacancy_cost:       number;
    private repair_cost:        number;
    private large_repair_cost:  number;
    private property_management_cost:   number;

    private calculation_dependencies: any;

    constructor(
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities) {
        
        this.vacancy_cost               = 0.00;
        this.repair_cost                = 0.00;
        this.large_repair_cost          = 0.0;
        this.property_management_cost   = 0.0;

        this.calculation_dependencies =
        {
            vacancy_cost:               ['vacancy_rate_perc','monthly_rent','purchase_month'],
            repair_cost:                ['repair_perc','monthly_rent'],
            large_item_repair_cost:     ['monthly_rent', 'large_item_repairs_perc'],
            property_management:        ['property_management_rate']
        }
    }

    ngOnInit() {
        this.property_inputs = this.fb.group({ })

        this.commonData.numbers
            .subscribe( data => {
                this.mortgageDetails = data;

                this.updateVacancyCost();
                this.updateRepairCost();
                this.updateLargeRepairCost();
                this.updatePropertyManagement();
            })
    }

    updateVacancyCost() {
        console.log("OperatingExpenseFormComponent#updatedVacancyCost");

        if( this.calculation_dependencies['vacancy_cost'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
            let percentage              = this.utilities.getFloatFor(this.mortgageDetails.vacancy_rate_perc);
            let purchase_month          = this.utilities.getIntFor(this.mortgageDetails.purchase_month);
            let monthly_rent            = this.utilities.getFloatFor(this.mortgageDetails.monthly_rent);
            let gross_scheduled_income  = monthly_rent * (12 - purchase_month);
    
            this.vacancy_cost = gross_scheduled_income * (percentage/100);
        }
    }

    updateRepairCost() {
        console.log("OperatingExpenseFormComponent#updateRepairCost");

        if( this.calculation_dependencies['repair_cost'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
            let percentage              = this.utilities.getFloatFor( this.mortgageDetails.repair_perc);
            let monthly_rent            = this.utilities.getFloatFor(this.mortgageDetails.monthly_rent);
    
            this.repair_cost            = monthly_rent * (percentage/100);
        }
    }

    updateLargeRepairCost() {
        console.log("OperatingExpenseFormComponent#updateLargeRepairCost");

        if( this.calculation_dependencies['large_item_repair_cost'].indexOf(this.mortgageDetails.keyChanged) != -1 ) {
            let percentage              = this.utilities.getFloatFor(this.mortgageDetails.large_item_repairs_perc);
            let monthly_rent            = this.utilities.getFloatFor(this.mortgageDetails.monthly_rent);
    
            this.large_repair_cost      = monthly_rent * (percentage/100);
            console.log("Cost: ", this.large_repair_cost);
        }
    }

    updatePropertyManagement() {
        console.log("OperatingExpenseFormComponent#updatePropertyManagement");

        let rate                        = this.utilities.getIntFor(this.mortgageDetails.property_management_rate);
        let monthly_rent                = this.utilities.getFloatFor(this.mortgageDetails.monthly_rent);
        
        this.property_management_cost   = monthly_rent * (rate / 100);
    }
}