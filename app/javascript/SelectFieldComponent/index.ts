import { CommonDataService } from './../CommonDataService/commonData';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { OnInit, Component, Input, Inject, Output, EventEmitter } from '@angular/core';
import template from "./template.html";
import { CommonUtilityService } from '../CommonUtilityService/commonUtility';

@Component({
    selector: 'select-field',
    template: template
})
export class SelectFieldComponent implements OnInit {
    @Input() formGroup;
    @Input() controlName;
    @Input() controlLabel;
    @Input() list;
    @Input() vals;
    @Input() val;
    @Input() default;
    @Input() persistable;

    @Output() valueChanged: EventEmitter<any>;

    private property_inputs: FormGroup
    private control_value: number;

    constructor(
        @Inject(FormBuilder) private fb, 
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities) 
    {
        this.valueChanged = new EventEmitter<any>();
    }

    ngOnInit() {
        this.property_inputs = this.fb.group({
            // control: [this.default || this.vals[0]]
            control: [ this.vals[0] ]
        })

        this.control_value = typeof this.vals[0] == "string" ?
            this.vals[0] :
            parseFloat(this.vals[0]);
    }

    formControls() {
        return this.property_inputs.value;
    }

    updatePropertyValues() {
        let current_val = this.formControls().control;

        if ( current_val != this.control_value ) {
            this.control_value = current_val;

            if (this.persistable) {
                this.updateCommonData();
            }

            this.valueChanged.emit(this.control_value);
        }
    }

    updateCommonData() {
        this.commonData.updatePropertyNumbers({ key: this.controlName, value: this.control_value });
    }
}