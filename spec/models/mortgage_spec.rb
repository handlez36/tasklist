require 'rails_helper'

RSpec.describe Mortgage, type: :model do
  let! (:mortgage) { create(:mortgage) }

  describe "add mortgage object" do
    it "should create mortgage object" do
      expect(Mortgage.count).to eq(1)
      expect(Mortgage.first.purchase_price).to eq(10000000)
      expect(Mortgage.first.down_payment_c.class).to eq(Money)
      expect(Mortgage.first.down_payment_c.to_s).to eq("20000.00")
    end
  end

  describe "Mortgage detail API call" do
    it "should call the Calc API" do
      payment = mortgage.calculate_payment

      expect(payment.class).to eq(Money)
      expect(payment.to_s).to eq("522.23")
    end
  end
  
end
