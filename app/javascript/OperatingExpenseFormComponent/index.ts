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
    private mortgageDetails:    number;

    private vacancy_cost:       number;
    private repair_cost:        number;

    constructor(
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities) {
        this.vacancy_cost = 0.00;
        this.repair_cost = 0.00;
    }

    ngOnInit() {
        this.property_inputs = this.fb.group({ })

        this.commonData.numbers
            .subscribe( data => {
                this.mortgageDetails = data;
            })
    }

    updatedVacancyCost(data) {
        console.log("OperatingExpenseFormComponent#updatedVacancyCost");

        let purchase_month          = this.utilities.getIntFor(this.mortgageDetails, "purchase_month");
        let monthly_rent            = this.utilities.getFloatFor(this.mortgageDetails, "monthly_rent");
        let gross_scheduled_income  = monthly_rent * (12 - purchase_month);

        this.vacancy_cost = gross_scheduled_income * (data/100);
    }

    updateRepairCost(data) {
        console.log("OperatingExpenseFormComponent#updateRepairCost");

        let repair_perc             = this.utilities.getFloatFor( this.mortgageDetails, "repair_perc");
        let monthly_rent            = this.utilities.getFloatFor(this.mortgageDetails, "monthly_rent");

        this.repair_cost            = monthly_rent * (data/100);
        console.log("Repair Cost: ", this.repair_cost);
    }
}