class AddRatingToRecipe < ActiveRecord::Migration[6.0]
  def change
    add_column :recipes, :rating, :integer
  end
end
