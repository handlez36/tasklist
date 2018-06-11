import { Injectable } from '@angular/core';
import * as accounting from 'accounting';

@Injectable()
export class CommonUtilityService {
    constructor() {}

    formatCurrencyToString(number) {
        console.log("CommonUtilityService#formatCurrencyToString");

        return accounting.formatMoney(number).replace("$","");
    }

    getFloatFor(details, key) {
        
        if(details[key]) {
            return typeof details[key] == "string" ?
                parseFloat( details[key].replace(",","") ) :
                details[key]
        } else {
            return 0;
        }
    }

    getIntFor(details, key) {
        
        if(details[key]) {
            return typeof details[key] == "string" ?
                parseInt( details[key].replace(",","") ) :
                details[key]
        } else {
            return 0;
        }
    }

}