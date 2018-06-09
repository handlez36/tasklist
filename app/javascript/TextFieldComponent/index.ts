import { CommonDataService } from './../CommonDataService/commonData';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
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

    @Output() valueChanged;

    private property_inputs: FormGroup
    private control_value: number;

    constructor(
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities) 
    {
    }

    ngOnInit() {
        this.property_inputs = this.fb.group({
            control: [{value: this.val, disabled: this.disable}]
        })

        this.control_value = parseFloat(this.val);
    }

    formControls() {
        return this.property_inputs.value;
    }

    updateInputFormat() {
        let current_val = typeof this.formControls().control == "string" ?
            parseFloat( this.formControls().control.replace(",","") ) || 0 :
            this.formControls().control;

        if ( current_val != this.control_value ) {
            this.control_value = current_val;

            this.property_inputs.controls.control
            .setValue( this.utilities.formatCurrencyToString(this.control_value) );
        
            this.updateCommonData();

            this.valueChanged.emit(this.control_value);
        }
    }

    updateCommonData() {
        this.commonData.updatePropertyNumbers({ key: this.controlName, value: this.control_value });
    }
}