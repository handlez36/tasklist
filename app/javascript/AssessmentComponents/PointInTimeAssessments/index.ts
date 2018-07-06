import { ProfileComponent } from './../../ProfileComponent/index';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonDataService } from './../../CommonDataService/commonData';
import { Component, OnInit, Inject } from "@angular/core";
import template from './template.html';
import * as Amortization from 'amortization';
import * as Finance from 'financejs';
import * as Engine from 'irr-npv';
import { CommonUtilityService } from '../../CommonUtilityService/commonUtility';

@Component({
    selector: 'apod-assessment',
    template: template
})
export class APODComponent implements OnInit {
    private mortgageDetails: any;
    private finance: any;
    private engine: any;

    private rentToPurchaseRatioResult:  any = "Fail";

    private vacancyRateCost:            any = [];
    private yearlyRepairBudget:         any = [];
    private yearlyCapExBudget:          any = [];
    private yearlyWater:                any = [];
    private yearlyGas:                  any = [];
    private yearlyElectricity:          any = [];
    private yearlyGarbage:              any = [];
    private yearlyHoa:                  any = [];
    private yearlyMaintenance:          any = [];
    private yearlyPropManagement:       any = [];
    private yearlyOther:                any = [];
    private yearlyPropInsurance:        any = [];
    private yearlyPropTaxes:            any = [];
    private totalOperatingExpenses:     any = [];
    private annualDebtService:          any = [];

    private grossScheduledIncome:       number[];
    private grossOperatingIncome:       any = [];
    private netOperatingIncome:         any = [];
    private cashFlowBeforeTaxes:        any = [];
    private cashFlowAfterTaxes:         any = [];
    private sellingPrice:               any = [];
    private cashFlowAfterSell:          any = [];
    private mortgagePayoff:             any = [];
    private estimatedCostOfSalePerc:    any = 0.06;
    private estimatedCostOfSale:        any = [];
    private afterSaleProceeds:          any = [];

    private cashOnCashROI:              any;
    private reinvestRate:               any = 0;
    private safeRate:                   any = 5;
    private internalRateReturn:         any;
    private debtCoverageRatio:          any;

    private annualExpenseIncrease:      any = 0;
    private annualIncomeIncrease:       any = 0;
    private annualAppreciationIncrease: any = 2;

    private analysis_years:             any = 1;
    private years:                      any = [];

    private calculation_dependencies:   any;
    
    constructor(
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities
    ) 
    {
        this.finance = new Finance();
    }

    ngOnInit() {
        console.log("APODComponent#ngOnInit");

        this.commonData.numbers
            .subscribe( data => {
                this.mortgageDetails = data;
                this.updateAllCalculations();
            })
    }

    updateAllCalculations() {
        this.resetValues();

        for(let i=0; i < this.analysis_years; i++) {                    
            this.years[i] = i;
        
            // Array value calculations
            this.updateGrossScheduledIncome(i);
            this.updateVacancyExpense(i);
            this.updateGrossOperatingIncome(i);
            this.updateTotalOperatingExpenses(i);
            this.updateNetOperatingIncome(i);
            this.updateAnnualDebtService(i);
            this.updateCashFlowBeforeTaxes(i);
            this.updateSellPrice(i);
            this.updateCostOfSale(i);
            this.updateMortgagePayoff(i)
            this.updateAfterSaleProceeds(i);
        }
        
        // Single value calculations
        this.updateCOCROI();
        this.updateIRR();
        this.updateTwoPercRule();
    }

    updateGrossScheduledIncome(year) {
        let monthly_rent        = this.utilities.getFloatFor(this.mortgageDetails.monthly_rent);
        let purchase_month      = this.utilities.getIntFor(this.mortgageDetails.purchase_month);
        let months_remaining    = 12 - purchase_month;

        if (year > 0) {
            monthly_rent        = this.calculateFutureValue(monthly_rent, year, this.annualIncomeIncrease);
            months_remaining    = 12;
        }

        this.grossScheduledIncome[year] = monthly_rent * months_remaining;
    }

    updateVacancyExpense(year) {
        this.vacancyRateCost[year] = this.utilities.getFloatFor(this.mortgageDetails.vacancy_rate_cost);
    }

    updateGrossOperatingIncome(year) {
        this.grossOperatingIncome[year] = this.grossScheduledIncome[year] - this.vacancyRateCost[year];
    }

    updateTotalOperatingExpenses(year) {
        this.totalOperatingExpenses[year] = this.calculateOperatingExpenses(year);
    }

    updateNetOperatingIncome(year) {
        this.netOperatingIncome[year] = this.grossOperatingIncome[year] - this.totalOperatingExpenses[year];
    }

    updateAnnualDebtService(year) {
        this.annualDebtService[year] = this.calculateAnnualDebtService(year);
    }

    updateCashFlowBeforeTaxes(year) {
        this.cashFlowBeforeTaxes[year] = this.netOperatingIncome[year] - this.annualDebtService[year];
    }

    updateCOCROI() {
        let totalCostOfInvestment = this.calculateTotalCostOfInvestment();

        this.cashOnCashROI = this.cashFlowBeforeTaxes[0] > 0 ?
            ( this.cashFlowBeforeTaxes[0] / totalCostOfInvestment  ) * 100 :
            0;
    }

    updateIRR() {
        console.log("APODComponent#updateIRR");
        let initialInvestment   = -1 * this.calculateTotalCostOfInvestment();

        console.log("Initial investment: ", initialInvestment);
        if (Math.abs(initialInvestment) > 0 ) {
            this.internalRateReturn = this.calculateMIRR(
                initialInvestment, 
                this.cashFlowBeforeTaxes, 
                this.reinvestRate,
                this.safeRate);
        }
    }

    updateTwoPercRule() {
        console.log("APODComponent#updateTwoPercRule");
        let monthly_rent        = this.utilities.getFloatFor(this.mortgageDetails.monthly_rent);
        let purchase_price      = this.utilities.getFloatFor(this.mortgageDetails.price);

        let ratio = (monthly_rent / purchase_price) * 100;

        this.rentToPurchaseRatioResult = 
            ratio >= 2 ? "Pass" : "Fail";
    }

    changeApodYears(year) {
        console.log("PointInTimeAssessments#changeApodYears");

        if( year >= 0 || year <= 30 ) {
            this.analysis_years = year;
            this.updateAllCalculations();
        }
    }

    updateSellPrice(year) {
        let originalPrice   = this.mortgageDetails.after_repair_value;
        let rate            = 0.03; 

        this.sellingPrice[year] = 
            this.calculateFutureValue(originalPrice, year - 1, rate) ||
            0.0;
    }

    updateCostOfSale(year) {
        let salePrice   = this.sellingPrice[year];

        this.estimatedCostOfSale[year] = 
            salePrice * this.estimatedCostOfSalePerc ||
            0.00;
    }

    updateAfterSaleProceeds(year) {
        this.afterSaleProceeds[year] = 
            (this.sellingPrice[year] - this.estimatedCostOfSale[year] - this.mortgagePayoff[year]) || 
            0.00;
    }

    updateMortgagePayoff(year) {
        let price               = this.utilities.getFloatFor(this.mortgageDetails.price);
        let dp                  = this.utilities.getFloatFor(this.mortgageDetails.down_payment);
        let loan_points         = this.utilities.getFloatFor(this.mortgageDetails.loan_points);
        let term                = this.utilities.getFloatFor(this.mortgageDetails.mortgage_term);
        let rate                = this.utilities.getFloatFor(this.mortgageDetails.interest_rate);
        let loan_point_cost     = price * (loan_points / 100);

            
        if (price > 0) {
            let amortized_schedule  = Amortization.amortizationSchedule( price - dp - loan_point_cost, term, rate );

            this.mortgagePayoff[year] = (amortized_schedule.length >= 1) ?
                amortized_schedule[year].principalBalance :
                0.00;
        } else {
            this.mortgagePayoff[year] = 0.00;
        }
    }

    calculateMIRR(initialInvestment, cashFlows, reinvestmentRate, financeRate) {
        let cashFlowCount = cashFlows.length;
        let positiveCashFlows = [];
        let negativeCashFlows = [];
        let index = 1;
        let negativeCashFlow = false;

        cashFlows.forEach( cashFlow => {
            if(cashFlow < 0) {
                negativeCashFlow = true;
                let temp_arr = [];
                for(let i=0; i<(index-1); i++) {
                    temp_arr.push(0)
                }
                temp_arr.push(cashFlow);
                initialInvestment = this.finance.NPV(cashFlowCount, initialInvestment, ...temp_arr);
            } else {
                let fv = this.calculateFutureValue(cashFlow, cashFlowCount-(index+1), this.reinvestRate);
                
                positiveCashFlows.push(fv);
            }
            index ++;
        })

        let finalTotal = [];
        // if(negativeCashFlow && positiveCashFlows.length > 0) {
        if(negativeCashFlow) {
            for(let i=0; i<cashFlowCount; i++) {
                i == cashFlowCount - 1 ?
                    finalTotal.push( positiveCashFlows.reduce( (total, amt) => { total += amt }, 0 ) ) :
                    finalTotal.push(0);
            }
        } else {
            finalTotal = positiveCashFlows;
        }
        
        finalTotal.unshift(initialInvestment);
        return finalTotal.length > 0 ?
            Engine.irr(finalTotal) :
            0;
    }

    calculateTotalCostOfInvestment() {
        let down_payment    = this.utilities.getFloatFor( this.mortgageDetails.down_payment );
        let loan_points     = this.utilities.getFloatFor( this.mortgageDetails.loan_point_cost );
        let closing_cost    = this.utilities.getFloatFor( this.mortgageDetails.closing_cost );
        let pre_rent_cost   = this.utilities.getFloatFor( this.mortgageDetails.pre_rent_holding_cost );
        let total_repairs   = this.utilities.getFloatFor( this.mortgageDetails.estimated_repair_cost );

        return down_payment + loan_points + closing_cost + pre_rent_cost + total_repairs;

    }

    calculateFutureValue(starting_amt, years, rate_of_increase) {
        return starting_amt * (1 + rate_of_increase) ** (years + 1)
    }

    calculateAnnualDebtService(year) {
        let purchase_month          = this.utilities.getIntFor(this.mortgageDetails.purchase_month);
        let monthly_payment         = this.utilities.getFloatFor(this.mortgageDetails.monthly_payment);
        let months_remaining        = (year > 0) ? 12 : 12 - purchase_month;

        return monthly_payment * months_remaining;
    }

    calculateOperatingExpenses(year) {
        let year_one_total_months  = 12 - this.utilities.getIntFor(this.mortgageDetails.purchase_month);
        let total_months           = 12;
        let months_remaining       = (year > 0) ? total_months : year_one_total_months;

        this.yearlyRepairBudget.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.repair_cost), year, this.annualExpenseIncrease) * months_remaining);
        
        this.yearlyCapExBudget.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.large_item_repairs_cost), year, this.annualExpenseIncrease) * months_remaining);

        this.yearlyWater.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.water_utility), year, this.annualExpenseIncrease) * months_remaining);

        this.yearlyGarbage.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.garbage_utility), year, this.annualExpenseIncrease) * months_remaining);

        this.yearlyGas.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.gas_utility), year, this.annualExpenseIncrease) * months_remaining);

        this.yearlyElectricity.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.electricity_utility), year, this.annualExpenseIncrease) * months_remaining);

        this.yearlyHoa.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.hoa), year, this.annualExpenseIncrease) * months_remaining);

        this.yearlyMaintenance.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.maintenance), year, this.annualExpenseIncrease) * months_remaining);

        this.yearlyPropManagement.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.property_management), year, this.annualExpenseIncrease) * months_remaining);

        this.yearlyPropTaxes.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.property_taxes), year, this.annualExpenseIncrease) * months_remaining);

        this.yearlyPropInsurance.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.property_insurance), year, this.annualExpenseIncrease) * months_remaining);

        this.yearlyOther.push(
            this.calculateFutureValue(
                this.utilities.getFloatFor(this.mortgageDetails.other), year, this.annualExpenseIncrease) * months_remaining);

        return this.yearlyRepairBudget[year]
            + this.yearlyCapExBudget[year]
            + this.yearlyWater[year]
            + this.yearlyGarbage[year]
            + this.yearlyGas[year]
            + this.yearlyElectricity[year]
            + this.yearlyHoa[year]
            + this.yearlyMaintenance[year]
            + this.yearlyPropManagement[year]
            + this.yearlyPropTaxes[year]
            + this.yearlyPropInsurance[year]
            + this.yearlyOther[year];
    }

    hasOperatingExpenseFor(expense) {
        return expense.reduce( (total, amt) => total += amt ) > 0
    }

    resetValues() {
        this.yearlyRepairBudget = []; this.yearlyCapExBudget = []; this.yearlyWater = []; this.yearlyGas = [];
        this.yearlyElectricity = []; this.yearlyGarbage = []; this.yearlyHoa = []; this.yearlyMaintenance = [];
        this.yearlyPropManagement = []; this.yearlyOther = []; this.yearlyPropInsurance = []; this.yearlyPropTaxes = [];
        this.totalOperatingExpenses = []; this.annualDebtService = []; this.grossScheduledIncome = []; this.grossOperatingIncome = [];
        this.netOperatingIncome = []; this.cashFlowBeforeTaxes = []; this.cashFlowAfterTaxes = []; this.debtCoverageRatio = [];
        this.vacancyRateCost = []; this.cashFlowAfterSell = []; this.sellingPrice = []; this.years = [];
        this.estimatedCostOfSale = []; this.mortgagePayoff = []; this.afterSaleProceeds = [];
    }
}