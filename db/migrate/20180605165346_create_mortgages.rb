class CreateMortgages < ActiveRecord::Migration[5.1]
  def change
    create_table :mortgages do |t|
      t.decimal :purchase_price, precision: 10, scale: 2
      t.decimal :down_payment, precision: 10, scale: 2
      t.integer :mortgage_term
      t.decimal :interest_rate, precision: 10, scale: 2
      t.decimal :property_tax, precision: 10, scale: 2
      t.decimal :property_insurance, precision: 10, scale: 2
      t.decimal :pmi, precision: 3, scale: 2
      t.date    :first_payment_date
      t.string  :notes

      t.timestamps
    end
  end
end
