class ChangeRecipeTypeColumn < ActiveRecord::Migration[6.0]
	def self.up
		rename_column :recipes, :type, :recipe_type
    end
end
