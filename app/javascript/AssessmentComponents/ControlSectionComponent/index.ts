import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, Inject, Output, EventEmitter } from "@angular/core";
import template from './template.html';

@Component({
    selector: 'apod-control-section',
    template: template
})
export class ControlSegmentComponent implements OnInit {
    @Output('type') apodTypeChanged: EventEmitter<any>;
    @Output('years') apodYearsChanged: EventEmitter<any>;
    
    private apod_inputs:      any;
    
    private apodType:       any = 'Point in Time';
    private apodTypes:      any = ['Point in Time',  'Over Time']
    private apodNumYears:   any = 1;
    private apodYears:      any = [];
    
    constructor(@Inject(FormBuilder) private fb) {
        console.log("ControlSegmentComponent#constructor");

        this.apodTypeChanged    = new EventEmitter<any>();
        this.apodYearsChanged   = new EventEmitter<any>();
    }    

    ngOnInit() {
        this.apod_inputs = this.fb.group({ });

        for(let i=0; i<30; i++) { this.apodYears.push(i+1) }
    }

    selectApodType(newType) {
        console.log("ControlSectionComponent#selectApodType");
        this.apodTypeChanged.emit(newType);
    }

    selectApodYears(chosenYear) {
        console.log("ControlSectionComponent#selectApodYears");
        this.apodYearsChanged.emit(chosenYear);
    }

}