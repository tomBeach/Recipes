class Nationality < ApplicationRecord
	before_destroy :remove_recipe_references

	private
		def remove_recipe_references
			puts "\n******* remove_recipe_references *******"
			# recipes = Recipe.where(:nationality_id = )
		end
end
