class HomeController < ApplicationController

	# ======= all_recipes =======
	def all_recipes
		puts "\n******* all_recipes *******"
		get_recipe_data("all", "")
	end

	# ======= search_ingredient =======
    def search_ingredient
        puts "\n******* search_ingredient *******"
		get_recipe_data("ingredients", params[:_json].downcase)
	end

	# ======= search_title =======
    def search_title
        puts "\n******* search_title *******"
		get_recipe_data("titles", params[:_json].downcase)
	end

	# ======= search_category =======
    def search_category
        puts "\n******* search_category *******"
		get_recipe_data("category", params[:_json].to_i)
	end

	# ======= search_nationality =======
    def search_nationality
        puts "\n******* search_nationality *******"
		get_recipe_data("nationality", params[:_json].to_i)
	end

	# ======= get_recipe_data =======
    def get_recipe_data(search_type, search_term)
        puts "\n******* get_recipe_data *******"
		puts "search_type: #{search_type}"
		puts "search_term: #{search_term}"

		if search_type == "all"
			recipes = Recipe.all
			recipe_data = make_recipe_array(recipes, search_term)
			recipe_array = recipe_data[0]
			message = recipe_data[1]
		elsif search_type == "ingredients"
			recipes = Recipe.all
			recipe_data = make_recipe_array(recipes, search_term, search_type)
			recipe_array = recipe_data[0]
			message = recipe_data[1]
		elsif search_type == "titles"
			recipes = Recipe.where("lower(title) LIKE ?", "%" + search_term + "%")
			recipe_data = make_recipe_array(recipes, search_term)
			recipe_array = recipe_data[0]
			message = recipe_data[1]
		elsif search_type == "category"
			recipes = Recipe.where(:category_id => search_term)
			search_term = Category.where(:id => search_term).first[:category]		# convert category_id to category text
			recipe_data = make_recipe_array(recipes, search_term)
			recipe_array = recipe_data[0]
			message = recipe_data[1]
		elsif search_type == "nationality"
			recipes = Recipe.where(:nationality_id => search_term)
			search_term = Nationality.where(:id => search_term).first[:nationality]	# convert nationality_id to nationality text
			recipe_data = make_recipe_array(recipes, search_term)
			recipe_array = recipe_data[0]
			message = recipe_data[1]
		end

		respond_to do |format|
			format.json {
				render json: {:message => message, :search => search_term, :categoryObj => category_obj, :nationalityObj => nationality_obj, :recipeArray => recipe_array}
			}
		end
	end

end
	# ======= make_recipe_array =======
	def make_recipe_array(recipes, search_term, search_type)
		puts "\n******* make_recipe_array *******"
		puts "search_term: #{search_term}"
		puts "search_type: #{search_type}"

		recipe_array = []
		recipe_count = 0
		recipe_data = {}

		if recipes.length > 0
			recipes.each do |next_recipe|

				if search_type
					target_ingredients = next_recipe.ingredients.where("ingredient LIKE ?", "%" + search_term + "%")
					puts "target_ingredients.length: #{target_ingredients.length}"
					if target_ingredients.length > 0
						recipe_data = {
							id: next_recipe.id,
							rating: next_recipe.rating,
							category_id: next_recipe.category_id,
							nationality_id: next_recipe.nationality_id,
							title: next_recipe.title,
							ingredients: next_recipe.ingredients,
							instructions: next_recipe.instructions }
						recipe_count = recipe_count + 1
						recipe_array.push(recipe_data)
					else
						puts "NO RECORDS"
					end
				else
					recipe_data = {
						id: next_recipe.id,
						rating: next_recipe.rating,
						category_id: next_recipe.category_id,
						nationality_id: next_recipe.nationality_id,
						title: next_recipe.title,
						ingredients: next_recipe.ingredients,
						instructions: next_recipe.instructions }
					recipe_array.push(recipe_data)
					recipe_count = recipe_count + 1
				end
			end
		else
			puts "NO RECORDS"
		end
		message = make_message_text(search_type, search_term, recipe_count)
		return [recipe_array, message]
	end

	# ======= make_message_text =======
    def make_message_text(search_type, search_term, recipe_count)
        puts "\n******* make_message_text *******"

		if search_type == "all"
			if recipe_count == 0
				message = "No recipes were retrieved from the database."
			elsif recipe_count > 0
				message = "Here are all " + recipe_count.to_s + " recipes from the database."
			end
		elsif search_type == "ingredients"
			if recipe_count == 0
				message = "No recipes found with " + search_term + " as an ingredient."
			elsif recipe_count == 1
				message = recipe_count.to_s + " recipe found with " + search_term + " as an ingredient."
			elsif recipe_count > 1
				message = recipe_count.to_s + " recipes found with " + search_term + " as an ingredient."
			end
		elsif search_type == "titles"
			if recipe_count == 0
				message = "No recipes found with " + search_term + " in the title."
			elsif recipe_count == 1
				message = recipe_count.to_s + " recipe found with " + search_term + " in the title."
			elsif recipe_count > 1
				message = recipe_count.to_s + " recipes found with " + search_term + " in the title."
			end
		elsif search_type == "category"
			if recipe_count == 0
				message = "No " + search_term + " type recipes were found."
			elsif recipe_count == 1
				message = recipe_count.to_s + " " + search_term + " type recipe was found."
			elsif recipe_count > 1
				message = recipe_count.to_s + " " + search_term + " type recipes were found."
			end
		elsif search_type == "nationality"
			if recipe_count == 0
				message = "No " + search_term + " recipes were found."
			elsif recipe_count == 1
				message = recipe_count.to_s + " " + search_term + " recipe was found."
			elsif recipe_count > 1
				message = recipe_count.to_s + " " + search_term + " recipes were found."
			end
		end
		return message
	end
