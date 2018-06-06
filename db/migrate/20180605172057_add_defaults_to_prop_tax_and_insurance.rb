class AddDefaultsToPropTaxAndInsurance < ActiveRecord::Migration[5.1]
  def change
    change_column_default :mortgages, :property_tax, 0.0
    change_column_default :mortgages, :property_insurance, 0.0
  end
end
