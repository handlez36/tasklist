class AddMonthlyPaymentToMortgages < ActiveRecord::Migration[5.1]
  def change
    add_column :mortgages, :monthly_payment, :decimal, precision: 10, scale: 2
  end
end
