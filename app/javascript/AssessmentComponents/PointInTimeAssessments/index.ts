import { CommonDataService } from './../../CommonDataService/commonData';
import { Component, OnInit, Inject } from "@angular/core";
import template from './template.html';
import { CommonUtilityService } from '../../CommonUtilityService/commonUtility';

@Component({
    selector: 'apod-assessment',
    template: template
})
export class APODComponent implements OnInit {
    private mortgageDetails: any;

    private xPercentTestResult:         any;

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

    private cashOnCashROI:              any;
    private debtCoverageRatio:          any;

    private annualExpenseIncrease:      any = 0;
    private annualIncomeIncrease:       any = 0;
    private annualAppreciationIncrease: any = 2;

    private analysis_years:             any = 10;
    private years:                      any = [];

    private calculation_dependencies:   any;
    
    constructor(
        @Inject(CommonDataService) private commonData,
        @Inject(CommonUtilityService) private utilities
    ) 
    {
    }

    ngOnInit() {
        console.log("APODComponent#ngOnInit");

        this.commonData.numbers
            .subscribe( data => {
                this.resetValues();
                this.mortgageDetails = data;
                for(let i=0; i < this.analysis_years; i++) {                    
                    this.years[i] = i;
                
                    this.updateGrossScheduledIncome(i);
                    this.updateVacancyExpense(i);
                    this.updateGrossOperatingIncome(i);
                    this.updateTotalOperatingExpenses(i);
                    this.updateNetOperatingIncome(i);
                    this.updateAnnualDebtService(i);
                    this.updateCashFlowBeforeTaxes(i);

                    this.updateCOCROI();
                    
                }
                // updateCashFlowAfterTaxes();

                // updateCOCROI();

            })
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
        
        console.log( "COCROI: ", this.cashOnCashROI);
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
    }
}