import { Injectable } from '@angular/core';
import * as accounting from 'accounting';

@Injectable()
export class CommonUtilityService {
    constructor() {}

    formatCurrencyToString(number) {
        console.log("CommonUtilityService#formatCurrencyToString");

        return accounting.formatMoney(number).replace("$","");
    }

    getFloatFor(value) {
        return (typeof value == "string" ?
            parseFloat( value.replace(",","") ) :
            value) || 0.00;
    }

    getIntFor(value) {
            return (typeof value == "string" ?
                parseInt( value.replace(",","") ) :
                value) || 0;
    }

    calculateCOCROI(investedAmt, annualIncome) {
        return ( investedAmt / annualIncome ) * 100;
    }

}