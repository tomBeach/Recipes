class AddCategoryToRecipe < ActiveRecord::Migration[6.0]
  def change
    add_column :recipes, :category_id, :integer
  end
end
