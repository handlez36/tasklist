import { CommonDataService } from './../CommonDataService/commonData';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { OnInit, Component, Input, Inject, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import template from "./template.html";
import { CommonUtilityService } from '../CommonUtilityService/commonUtility';
import { CurrencyPipe } from '@angular/common';

@Component({
    selector: 'text-field',
    template: template
})
export class TextFieldComponent implements OnInit {
    @Input() formGroup;
    @Input() controlName;
    @Input() controlLabel;
    @Input() icon;
    @Input() disable;
    @Input() placeholder;
    @Input() val;
    @Input() persist: boolean = true;
    // @Input() transform: boolean = true;
    @Input() transform: string = "currency";

    @Output() valueChanged: EventEmitter<any>;
    @Output() valManuallyChanged: EventEmitter<any>;

    private property_inputs: FormGroup
    private control_value: any;
    private infocus: boolean = false;
    private indirectChangeFields: any;

    constructor(
        @Inject(CurrencyPipe) private myCurrencyPipe,
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities,
        private cdRef:ChangeDetectorRef) 
    {
        this.valueChanged = new EventEmitter<any>();

        this.indirectChangeFields = 
        [
            "repair_paint_carpet", "closing_cost", "pre_rent_holding_cost",
            "loan_point_cost", "vacancy_rate_cost", "estimated_repair_cost",
            "monthly_payment", "total_interest", "prop_info_price", //"price",
            "after_repair_value", "property_management"
        ]
    }

    ngOnInit() {
        this.property_inputs = this.fb.group({
            control: [{value: this.val, disabled: this.disable}]
        })

        // this.control_value = parseFloat(this.val);
    }

    formControls() {
        return this.property_inputs.value;
    }

    inFocus() {
        this.infocus = true;
    }

    indirectUpdate() {
        console.log("Indirect update:" + this.controlName + " = " + this.formControls().control );
        if ( ( this.indirectChangeFields.indexOf(this.controlName) != -1 )
             && !this.infocus )
        {
            if (this.didValueChange()) {
                setTimeout( () => {
                    this.updateInputFormat(true);
                }, 300 )
            }
        }
    }

    didValueChange() {
        let originalValue = this.utilities.getFloatFor( this.formControls().control );
        let currentValue  = this.utilities.getFloatFor( this.val );

        return originalValue != currentValue;
    }

    updateInputFormat(indirectUpdatedValue = false) {
        this.infocus = false;

        let current_val = typeof this.formControls().control == "string" ?
            parseFloat( this.formControls().control.replace(",","") ) || 0 :
            this.formControls().control;

        let newVal = (typeof this.val == "string") ?
            parseFloat(this.val.replace(",","")) :
            this.val
        
        current_val = (indirectUpdatedValue) ? 
            parseFloat(newVal) : 
            current_val;

        if ( current_val != this.utilities.getFloatFor(this.control_value) ) {
            this.control_value = current_val;

            if (this.transform != "none") {
                let strVal = (this.transform == "currency") ?
                    this.utilities.formatCurrencyToString(current_val) :
                    this.utilities.formatCommasToString(current_val)

                this.property_inputs.controls.control.setValue(strVal);

                this.control_value = strVal;
            }

            if (this.persist) {
                console.log("Is this an indirect update? " + indirectUpdatedValue)
                this.updateCommonData();
            }

            this.valueChanged.emit(this.control_value);
        }
    }

    updateCommonData() {
        this.commonData.updatePropertyNumbers({ key: this.controlName, value: this.control_value });
    }
}