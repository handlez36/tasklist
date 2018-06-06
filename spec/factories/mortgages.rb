FactoryBot.define do
  factory :mortgage do
    purchase_price      { 100000 * 100 }
    down_payment        { 20000 * 100 }
    mortgage_term       30
    interest_rate       5.5
    property_tax        0.0
    property_insurance  0.0
    pmi                 0.52
    first_payment_date  Date.parse('2018-04-19')
  end
end
