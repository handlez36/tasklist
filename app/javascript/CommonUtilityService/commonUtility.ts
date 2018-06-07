import { Injectable } from '@angular/core';
import * as accounting from 'accounting';

@Injectable()
export class CommonUtilityService {
    constructor() {}

    formatCurrencyToString(number) {
        console.log("CommonUtilityService#formatCurrencyToString");

        return accounting.formatMoney(number).replace("$","");
    }

}