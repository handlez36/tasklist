import { CommonDataService } from './../CommonDataService/commonData';
import { FormGroup, FormBuilder } from '@angular/forms';
import { OnInit, Component, Input, Inject, Output } from '@angular/core';
import template from "./template.html";
import { CommonUtilityService } from '../CommonUtilityService/commonUtility';

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

    @Output() currentVal;

    private property_inputs: FormGroup
    private control_value: number;

    constructor(
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities) {
    }

    ngOnInit() {
        this.property_inputs = this.formGroup;

        this.property_inputs = this.fb.group({
            control: []
        })
    }

    formControls() {
        return this.property_inputs.value;
    }

    updateInputFormat() {
        this.control_value = parseFloat( this.formControls().control.replace(",","") ) || 0;
        this.property_inputs.controls.control
            .setValue( this.utilities.formatCurrencyToString(this.control_value) );
        
        this.updateCommonData();
    }

    updateCommonData() {
        let currentValue = parseFloat( this.formControls().control );

        this.commonData.updatePropertyNumbers({ key: this.controlName, value: currentValue });
    }
}