class AddNationalityToRecipe < ActiveRecord::Migration[6.0]
  def change
    add_reference :recipes, :nationality, null: true, foreign_key: true
  end
end
