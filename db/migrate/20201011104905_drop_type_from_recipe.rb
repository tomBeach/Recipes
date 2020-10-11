class DropTypeFromRecipe < ActiveRecord::Migration[6.0]
	def up
		remove_column :recipes, :recipe_type
    end

    def down
		add_column :recipes, :recipe_type, :string
    end
end
