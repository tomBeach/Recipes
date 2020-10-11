class HomeController < ApplicationController

	# ======= index =======
	def index
		puts "\n******* index *******"

		@categories = Category.all
		@nationalities = Nationality.all
		if current_user
			puts "** current_user: #{current_user}"
		else
			puts "** NO current_user **"
		end
	end

	# ======= ======= ======= RECIPES ======= ======= =======
    # ======= ======= ======= RECIPES ======= ======= =======
    # ======= ======= ======= RECIPES ======= ======= =======

	# ======= get_recipes =======
    def get_recipes
        puts "\n******* get_recipes *******"

		recipe_array = []
		recipe_count = 0
		recipe_data = {}
		@categories = Category.all
		@nationalities = Nationality.all
		@recipes = Recipe.all

		category_obj = {}
		nationality_obj = {}

		if @categories.length > 0
			@categories.each do |next_category|
				category_obj[next_category.id] = next_category.category
			end
		end

		if @nationalities.length > 0
			@nationalities.each do |next_nationality|
				nationality_obj[next_nationality.id] = next_nationality.nationality
			end
		end

		if @recipes.length > 0
			@recipes.each do |next_recipe|
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
		else
			message = "No recipes were retireved from the database."
		end

		message = "Here are all " + recipe_count.to_s + " recipes from the database."

		respond_to do |format|
			format.json {
				render json: {:message => message, :categoryObj => category_obj, :nationalityObj => nationality_obj, :recipeArray => recipe_array}
			}
		end
	end

	# ======= show_recipe =======
    def show_recipe
        puts "\n******* show_recipe *******"
		puts "params: #{params}"

		@categories = Category.all
		@nationalities = Nationality.all
		@recipe = Recipe.find(params[:id])
		puts "@recipe: #{@recipe}"

    end

	# ======= ======= ======= EDIT ======= ======= =======
    # ======= ======= ======= EDIT ======= ======= =======
    # ======= ======= ======= EDIT ======= ======= =======

	# ======= save_recipe =======
    def save_recipe
        puts "\n******* save_recipe *******"
		puts "params[:category_id]: #{params[:category_id]}"
		puts "params[:nationality_id]: #{params[:nationality_id]}"

		# == json data: recipe_id, recipe, rating, category_id, nationality_id, ingredients, instructions,

		message = ""
		recipe_fails_array = []
		ingredient_fails_array = []
		instruction_fails_array = []

		recipe = Recipe.find(params[:recipe_id])
		if !recipe.update(:rating => params[:rating], :category_id => params[:category_id], :nationality_id => params[:nationality_id])
			recipe_fails_array.push(params[:recipe_id])
			puts "*** RECIPE UPDATE ERROR"
		end

		# == update ingredients
        params[:ingredients].each do |next_ingredient|
            ingredient_id = next_ingredient[:id]
            ingredient = Ingredient.find(ingredient_id)

			if !ingredient.update(:ingredient => next_ingredient[:ingredient], :sequence => next_ingredient[:sequence])
				ingredient_fails_array.push(ingredient_id)
				puts "*** INGREDIENT UPDATE ERROR"
			end
        end

		# == update instructions
        params[:instructions].each do |next_instruction|
            instruction_id = next_instruction[:id]
            instruction = Instruction.find(instruction_id)

			if !instruction.update(:instruction => next_instruction[:instruction], :sequence => next_instruction[:sequence])
				instruction_fails_array.push(instruction_id)
				puts "*** INSTRUCTION UPDATE ERROR"
			end
        end

		if ingredient_fails_array.length > 0 || instruction_fails_array.length > 0 || recipe_fails_array.length > 0
			message = "One or more changes were not saved."
		else
			message = "Changes were saved successfully."
		end

		respond_to do |format|
			format.json {
				render json: {:message => message, :recipe_fails_array => recipe_fails_array, :ingredient_fails_array => ingredient_fails_array, :instruction_fails_array => instruction_fails_array}
			}
		end
    end

	# ======= ======= ======= SEARCH ======= ======= =======
    # ======= ======= ======= SEARCH ======= ======= =======
    # ======= ======= ======= SEARCH ======= ======= =======

	# ======= search_ingredients =======
    def search_ingredients
        puts "\n******* search_ingredients *******"
		puts "params[:_json]: #{params[:_json]}"

		search = params[:_json]
		recipe_count = 0
		recipe_array = []
		puts "search: #{search}"

		@recipes = Recipe.all
		@recipes.each do |next_recipe|
			@target_ingredients = next_recipe.ingredients.where("ingredient LIKE ?", "%" + search + "%")
			puts "@target_ingredients.length: #{@target_ingredients.length}"

			if @target_ingredients.length > 0
				recipe_data = { id:next_recipe.id, title:next_recipe.title }
				recipe_count = recipe_count + 1
				recipe_array.push(recipe_data)
			else
				puts "NO RECORDS"
			end
		end

		message = recipe_count.to_s + " recipes found with " + search + " as ingredient."
		puts "message: #{message}"
		puts "recipe_array: #{recipe_array}"

		respond_to do |format|
			format.json {
				render json: {:message => message, :search => search, :output => recipe_array}
			}
		end
    end

	# ======= search_recipes =======
    def search_recipes
        puts "\n******* search_recipes *******"
		puts "params[:_json]: #{params[:_json]}"

		search = params[:_json].downcase

		# == allow search to find singular version of search items
		if search.last == "s"
			search = search[0...-1]
		end

		recipe_count = 0
		recipe_array = []

		# == search for titles containing search string (case insensitive)
		@recipes = Recipe.where("lower(title) LIKE ?", "%" + search + "%")

		if @recipes.length > 0
			@recipes.each do |next_recipe|
				recipe_data = { id:next_recipe.id, title:next_recipe.title, type:next_recipe.recipe_type }
				recipe_count = recipe_count + 1
				recipe_array.push(recipe_data)
			end
		else
			puts "NO RECORDS"
		end

		if recipe_count > 1 || recipe_count == 0
			message = recipe_count.to_s + " recipes found with " + search + " in the title."
		else
			message = recipe_count.to_s + " recipe found with " + search + " in the title."
		end

		respond_to do |format|
			format.json {
				render json: {:message => message, :search => search, :output => recipe_array}
			}
		end
	end

	# ======= search_category =======
    def search_category
        puts "\n******* search_category *******"
		puts "params[:_json]: #{params[:_json]}"

		recipe_count = 0
		recipe_array = []
		which_category = params[:_json]

		# == search for titles containing search string (case insensitive)
		@recipes = Recipe.where(:category_id => which_category)

		if @recipes.length > 0
			@recipes.each do |next_recipe|
				recipe_data = { id:next_recipe.id, title:next_recipe.title, type:next_recipe.recipe_type }
				recipe_count = recipe_count + 1
				recipe_array.push(recipe_data)
			end
		else
			puts "NO RECORDS"
		end

		if recipe_count > 1 || recipe_count == 0
			message = recipe_count.to_s + " " + which_category + " type recipes were found."
		else
			message = "No " + which_category + " type recipes were found."
		end

		respond_to do |format|
			format.json {
				render json: {:message => message, :search => which_category, :output => recipe_array}
			}
		end
    end

	# ======= ======= ======= RECIPE FILES ======= ======= =======
    # ======= ======= ======= RECIPE FILES ======= ======= =======
    # ======= ======= ======= RECIPE FILES ======= ======= =======

	# ======= import_recipes =======
    def import_recipes
        puts "\n******* import_recipes *******"
    end

	# ======= save_recipe_file =======
    def save_recipe_file
        puts "\n******* save_recipe_file *******"
		puts "params[:_json]: #{params[:_json]}"

		# == initialize message variables
		existing_recipes_text = ""
		error_message = ""
		recipe_count = 0
		error_count = 0
		message = ""

		# == step through recipes json array
		params[:_json].each_with_index do |next_recipe, index|

			# == extract recipe component arrays (ingredients/instructions)
			title = next_recipe.require(:recipe).strip
			ingredients = next_recipe.require(:ingredients)
			instructions = next_recipe.require(:instructions)

			# == wrap title in single quotes to prevent sql syntax error
			recipe = Recipe.select("id").where("title = " + "\'" + title + "\'")

			# == no recipes with same title found
			if recipe.length == 0
				puts "NO RECORD"
				@recipe = Recipe.create(:title => title, :recipe_type => "recipe_type")
		        if @recipe.save
					puts "RECIPE SAVED"
					recipe_count = recipe_count + 1

					recipe_id = @recipe.id

					ingredients.each_with_index do |next_ingredient, index|
						next_ingredient = next_ingredient.permit(:quantity, :units, :ingredient)
						quantity = next_ingredient['quantity']
						units = next_ingredient['units']
						ingredient = next_ingredient['ingredient']
						sequence = index + 1
						if quantity == nil
							quantity = ""
						end
						if units == nil
							units = ""
						end
						if ingredient == nil
							ingredient = ""
						end
						ingredient = (quantity + " " + units + " " + ingredient).strip
						# puts "ingredient: #{ingredient}"
						@ingredient = Ingredient.create(:recipe_id => recipe_id, :ingredient => ingredient, :sequence => sequence)

						if @ingredient.save
							puts "Ingredient SAVED"
						else
							puts "Ingredient NOT SAVED"
							error_count = error_count + 1
						end
					end

					instructions.each_with_index do |next_instruction, index|
						instruction = next_instruction['instruction']
						sequence = index + 1
						@instruction = Instruction.create(:recipe_id => recipe_id, :instruction => instruction, :sequence => sequence)
						if @instruction.save
							puts "Instruction SAVED"
						else
							puts "Instruction NOT SAVED"
							error_count = error_count + 1
						end
					end

					if error_count > 0
						error_message = "There were " + error_count.to_s + " errors when saving ingredients or instructions."
					end
				end

			# == recipe with same title exists (no data saved)
			else
				puts "RECIPE EXISTS"
				recipe_id = recipe[0][:id]
				if existing_recipes_text == ""
					existing_recipes_text = existing_recipes_text + recipe_id.to_s
				else
					existing_recipes_text = existing_recipes_text + ", " + recipe_id.to_s
				end

			end

			if existing_recipes_text != ""
				message = "These recipes already exist: " + existing_recipes_text + ". " + error_message
			else
				message = recipe_count.to_s + " recipes were added to the database. " + error_message
			end
		end

		puts "message: " + message

		respond_to do |format|
			format.json {
				render :json => {:message => message}
			}
		end
    end

	private
		def recipe_params
			puts "******* recipe_params *******"
			params.permit(:_json)
		end

        def json_params
			puts "******* json_params *******"
			params.require(:home).permit(:item1, :item2, :item3)
        end

		def update_recipe_params
            puts "******* update_recipe_params *******"
			puts "params.inspect: #{params.inspect}"

			# param_keys: ["recipe_id", "recipe", "ingredients", "instructions", "controller", "action", "home"]
			#
			# params.permit(:recipe_id, :recipe, :ingredients => [], :instructions => [])
			# params.permit(:recipe_id, :recipe, :ingredients => [], :instructions => [], :controller, :action, :home)
			params.permit()
        end

end
