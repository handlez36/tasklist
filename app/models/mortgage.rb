class Mortgage < ApplicationRecord
    
    # Validations
    validates :purchase_price, :down_payment, :mortgage_term, :interest_rate, :first_payment_date, presence: true
    validates :purchase_price, :down_payment, :interest_rate, :pmi, numericality: { only_integer: false }
    validates :mortgage_term, numericality: { only_integer: true }

    # Monetize appropriate fields with RubyMoney gem
    monetize :purchase_price, as: "purchase_price_c"
    monetize :down_payment, as: "down_payment_c"
    monetize :property_tax, as: "property_tax_c"
    monetize :property_insurance, as: "property_insurance_c"
    monetize :monthly_payment, :as "monthly_payment_c"
end
