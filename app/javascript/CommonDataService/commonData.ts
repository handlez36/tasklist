import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from 'rxjs';
import "rxjs/add/observable/of";

@Injectable()
export class CommonDataService {
    numbers: BehaviorSubject<object> = new BehaviorSubject<object>({
        price: 0.0,
        dp: 0.0,
        monthly_payment: 0.0,
        mortgage_term: 0,
        property_size: 0,
        monthly_rent: 0.0
    });
    
    constructor() {}

    getPropertyNumbers(): Observable<object> {
        return Observable.of(this.numbers);
    }

    updatePropertyNumbers_old(updatedNumbers) {
        console.log("CommonDataService#updatePropertyNumbers_old");

        Object
            .keys(updatedNumbers)
            .forEach( k => {
                this.numbers[k] = updatedNumbers[k];
            });
        
        this.numbers.next(this.numbers);
    }

    updatePropertyNumbers(updatedField) {
        console.log("CommonDataService#updatePropertyNumbers");

        this.numbers[updatedField.key] = updatedField.value;
        this.numbers.next(this.numbers);
    }

}