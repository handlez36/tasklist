import { Component, OnInit, Inject } from '@angular/core';
import template from "./template.html";
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'operating-expenses-form',
    template: template
})
export class OperatingExpenseFormComponent implements OnInit {
    public testValue: number = 100;
    private property_inputs: FormGroup;

    constructor(@Inject(FormBuilder) private fb, ) {}

    ngOnInit() {
        this.property_inputs = this.fb.group({
            vacancy_rate_perc:  ["0.00"],
            vacancy_rate_cost:  ["0"],
            repair_perc:        ["0"],
            repair_cost:        ["0.00"],
            large_item_repairs: ["0.00"],
            water_utility:      ["0.00"],
            garbage_utility:      ["0.00"],
            gas_utility:      ["0.00"],
            electricity_utility:      ["0.00"],
            hoa:      ["0.00"],
            maintenance:      ["0.00"],
            property_management:    ["0.00"],
            other:                  ["0.00"]
        })       
    }

    updatedVacancyCost(event) {
        console.log("OperatingExpenseFormComponent#updatedVacancyCost");
    }
}