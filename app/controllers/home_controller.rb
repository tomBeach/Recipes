class HomeController < ApplicationController

	# ======= ======= ======= USERS ======= ======= =======
    # ======= ======= ======= USERS ======= ======= =======
    # ======= ======= ======= USERS ======= ======= =======

	# ======= index =======
	def index
		puts "\n******* index *******"

		# @categories = Category.all
		# @nationalities = Nationality.all
		if current_user
			puts "** current_user: #{current_user.inspect}"
		else
			puts "** NO current_user **"
		end
	end

	# ======= ======= ======= SEARCH ======= ======= =======
    # ======= ======= ======= SEARCH ======= ======= =======
    # ======= ======= ======= SEARCH ======= ======= =======

	# ======= my_recipes =======
	def my_recipes
		puts "\n******* my_recipes *******"
		get_recipe_data("my", "")
	end

	# ======= all_recipes =======
	def all_recipes
		puts "\n******* all_recipes *******"
		get_recipe_data("all", "")
	end

	# ======= search_text =======
    def search_text
        puts "\n******* search_text *******"
		# == params[:_json] structure: [searchString, searchText]
		get_recipe_data("text", params[:_json])
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

	# ======= search_rating =======
    def search_rating
        puts "\n******* search_rating *******"
		get_recipe_data("rating", params[:_json].to_i)
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

		rating_obj = make_rating_object
		category_obj = make_category_object
		nationality_obj = make_nationality_object

		# == get recently imported (or existing) recipes
		if search_type == "import"
			puts "\n** import **"

			# search_term structure for "import": [recipe_id1, recipe_id2, recipe_id3 ... message]
			message = search_term[search_term.length-1]
			search_term.pop()	# remove message so array contains recipe ids only
			recipes = Recipe.where(id: search_term).order(:updated_at).reverse_order
			search_term = "import"
			recipe_data = make_recipe_array(recipes, search_type, search_term)
			recipe_array = recipe_data[0]

		# == all recipes designated for sharing (function to be added)
		elsif search_type == "all"
			recipes = Recipe.where(:shared => true).order(:updated_at).reverse_order
			recipe_data = make_recipe_array(recipes, search_type, search_term)
			recipe_array = recipe_data[0]
			message = recipe_data[1]

		# == recipes belonging to user
		elsif search_type == "my"
			recipes = Recipe.where("user_id" => current_user[:id]).order(:updated_at).reverse_order
			recipe_data = make_recipe_array(recipes, search_type, search_term)
			recipe_array = recipe_data[0]
			message = recipe_data[1]

		elsif search_type == "text"

			# == search for search_term in title
			if search_term[0] == "title"
				recipes = Recipe.where("lower(title) LIKE ?", "%" + search_term[1] + "%").order(:updated_at).reverse_order
				recipe_data = make_recipe_array(recipes, search_term[0], search_term[1])
				recipe_array = recipe_data[0]
				message = recipe_data[1]

			# == get all shared and user-owned recipes; search ingredients in make_recipe_array function
			elsif search_term[0] == "ingredients"
				recipes = Recipe.where(:shared => true).order(:updated_at).reverse_order
				recipe_data = make_recipe_array(recipes, search_term[0], search_term[1])
				recipe_array = recipe_data[0]
				message = recipe_data[1]
			end

		# == search by rating
		elsif search_type == "rating"
			recipes = Recipe.where(:rating_id => search_term, :shared => true).order(:updated_at).reverse_order
			rating_id = search_term.to_i
			rating = rating_obj[rating_id][:rating]
			rating_text = rating[0].to_s + "/" + rating[1]
			recipe_data = make_recipe_array(recipes, search_type, rating_text)
			recipe_array = recipe_data[0]
			message = recipe_data[1]

		# == search by category
		elsif search_type == "category"
			recipes = Recipe.where(:category_id => search_term, :shared => true).order(:updated_at).reverse_order
			search_term = Category.where(:id => search_term).first[:category]		# convert category_id to category text
			recipe_data = make_recipe_array(recipes, search_type, search_term)
			recipe_array = recipe_data[0]
			message = recipe_data[1]

		# == search by nationality
		elsif search_type == "nationality"
			recipes = Recipe.where(:nationality_id => search_term, :shared => true).order(:updated_at).reverse_order
			search_term = Nationality.where(:id => search_term).first[:nationality]	# convert nationality_id to nationality text
			recipe_data = make_recipe_array(recipes, search_type, search_term)
			recipe_array = recipe_data[0]
			message = recipe_data[1]
		end

		respond_to do |format|
			format.json {
				render json: {:message => message, :search => search_term, :ratingObj => rating_obj, :categoryObj => category_obj, :nationalityObj => nationality_obj, :recipeArray => recipe_array}
			}
		end
	end

	# ======= make_recipe_array =======
	def make_recipe_array(recipes, search_type, search_term)
		puts "\n******* make_recipe_array *******"
		puts "search_type: #{search_type}"
		puts "search_term: #{search_term}"

		recipe_array = []
		recipe_count = 0
		recipe_data = {}
		message = ""

		if recipes.length > 0
			recipes.each do |next_recipe|

				if search_type == "ingredients"
					target_ingredients = next_recipe.ingredients.where("ingredient LIKE ?", "%" + search_term + "%")
					puts "target_ingredients.length: #{target_ingredients.length}"
					if target_ingredients.length > 0
						recipe_data = {
							id: next_recipe.id,
							shared: next_recipe.shared,
							rating_id: next_recipe.rating_id,
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
						shared: next_recipe.shared,
						rating_id: next_recipe.rating_id,
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
		if search_type != "import"
			message = make_message_text(search_type, search_term, recipe_count)
		end
		return [recipe_array, message]
	end

	# ======= make_message_text =======
    def make_message_text(search_type, search_term, recipe_count)
        puts "\n******* make_message_text *******"
		puts "search_type: #{search_type}"
		puts "search_term: #{search_term}"
		puts "recipe_count: #{recipe_count}"

		if search_type == "my"
			if recipe_count == 0
				message = "Sorry.  No recipes belonging to you were retrieved.  Try importing a new one!"
			elsif recipe_count == 1
				message = "Here is your recipe.  Try importing more when you can."
			elsif recipe_count > 0
				message = "Here are the " + recipe_count.to_s + " recipes belonging to you."
			end
		elsif search_type == "all"
			if recipe_count == 0
				message = "No recipes were retrieved from the database."
			elsif recipe_count > 0
				message = "Here are all " + recipe_count.to_s + " shared recipes from the database."
			end
		elsif search_type == "ingredients"
			if recipe_count == 0
				message = "No shared recipes were found with " + search_term + " as an ingredient."
			elsif recipe_count == 1
				message = recipe_count.to_s + " shared recipe was found with " + search_term + " as an ingredient."
			elsif recipe_count > 1
				message = recipe_count.to_s + " shared recipes were found with " + search_term + " as an ingredient."
			end
		elsif search_type == "title"
			if recipe_count == 0
				message = "No shared recipes were found with " + search_term + " in the title."
			elsif recipe_count == 1
				message = recipe_count.to_s + " shared recipe was found with " + search_term + " in the title."
			elsif recipe_count > 1
				message = recipe_count.to_s + " shared recipes were found with " + search_term + " in the title."
			end
		elsif search_type == "rating"
			if recipe_count == 0
				message = "No shared recipes rated as " + search_term + " were found."
			elsif recipe_count == 1
				message = recipe_count.to_s + " shared recipe rated as " + search_term + " was found."
			elsif recipe_count > 1
				message = recipe_count.to_s + " shared recipes rated as " + search_term + " were found."
			end
		elsif search_type == "category"
			if recipe_count == 0
				message = "No shared " + search_term + " recipes were found."
			elsif recipe_count == 1
				message = recipe_count.to_s + " " + search_term + " shared recipe was found."
			elsif recipe_count > 1
				message = recipe_count.to_s + " " + search_term + " shared recipes were found."
			end
		elsif search_type == "nationality"
			if recipe_count == 0
				message = "No shared " + search_term + " recipes were found."
			elsif recipe_count == 1
				message = recipe_count.to_s + " " + search_term + " shared recipe was found."
			elsif recipe_count > 1
				message = recipe_count.to_s + " " + search_term + " shared recipes were found."
			end
		end
		puts "message: #{message}"
		return message
	end

	# ======= ======= ======= RECIPES ======= ======= =======
    # ======= ======= ======= RECIPES ======= ======= =======
    # ======= ======= ======= RECIPES ======= ======= =======

	# ======= show_recipe =======
    def show_recipe
        puts "\n******* show_recipe *******"
		puts "params: #{params}"

		# == @rating @category @nationality from application controller callback
		@recipe = Recipe.find(params[:id])
		puts "@recipe: #{@recipe.inspect}"

		# ======= rating/category/nationality options =======
		@rating_ids = []
		@ratings.each_with_index do |rating, index|
			rating_text = rating.rating.to_s + ": " + rating.comment
			@rating_ids << [rating_text, rating[:id]]
		end

		@category_ids = []
		@categories.each_with_index do |category, index|
		    @category_ids << [category.category, category[:id]]
		end

		@nationality_ids = []
		@nationalities.each_with_index do |nationality, index|
		    @nationality_ids << [nationality.nationality, nationality[:id]]
		end


		# ======= selected rating/category/nationality =======
		puts "@recipe.rating_id: #{@recipe.rating_id}"
		if @recipe.rating_id == nil
			puts "no rating"
			@rating_ids.push(["no rating", nil])
			@rating = ["no rating", nil]
			@recipe.rating_id = 0
		else
			@rating = @recipe.rating_id
		end
		puts "@rating_ids: #{@rating_ids}"

		puts "@recipe.category_id: #{@recipe.category_id}"
		if @recipe.category_id == nil
			puts "no category"
			@category_ids.push(["no category", nil])
			@category = ["no category", nil]
			@recipe.category_id = 0
		else
			@category = @recipe.category_id
		end
		puts "@category_ids: #{@category_ids}"

		puts "@recipe.nationality_id: #{@recipe.nationality_id}"
		if @recipe.nationality_id == nil
			@nationality_ids.push(["no nationality", nil])
			@nationality = ["no nationality", nil]
			@recipe.nationality_id = 0
		else
			@nationality = @recipe.nationality_id
		end
		puts "@nationality_ids: #{@nationality_ids}"

    end

	# ======= delete_recipe =======
    def delete_recipe
        puts "\n******* delete_recipe *******"
		puts "params: #{params}"

		recipe = Recipe.find(params[:id])
		puts "recipe.inspect: #{recipe.inspect}"
		if Recipe.destroy(params[:id])
			message = "The " + recipe[:title] + " recipe was removed successfully."
		else
			message = "There was an error.  The " + recipe[:title] + " recipe was not removed."
		end

		respond_to do |format|
			format.json {
				render json: {:message => message}
			}
		end
	end

	# ======= ======= ======= EDIT ======= ======= =======
    # ======= ======= ======= EDIT ======= ======= =======
    # ======= ======= ======= EDIT ======= ======= =======

	# ======= save_recipe_edits =======
    def save_recipe_edits
        puts "\n******* save_recipe_edits *******"
		puts "params[:rating_id]: #{params[:rating_id]}"
		puts "params[:category_id]: #{params[:category_id]}"
		puts "params[:nationality_id]: #{params[:nationality_id]}"

		# == json data: recipe_id, recipe, rating_id, category_id, nationality_id, ingredients, instructions,

		message = ""
		recipe_fails_array = []
		ingredient_fails_array = []
		instruction_fails_array = []

		# == values not set by user; prepare for set to nil in database
		if params[:rating_id] == 0
			params[:rating_id] = nil
		end
		if params[:category_id] == 0
			params[:category_id] = nil
		end
		if params[:nationality_id] == 0
			params[:nationality_id] = nil
		end

		# == identify edited recipe and update to new json data values
		recipe = Recipe.find(params[:recipe_id])
		if !recipe.update(:title => params[:title], :shared => params[:shared], :rating_id => params[:rating_id], :category_id => params[:category_id], :nationality_id => params[:nationality_id])
			recipe_fails_array.push(params[:recipe_id])
			puts "*** RECIPE UPDATE ERROR"
		end

		# == update ingredients
		addIngredientCount = 0
		deleteIngredientCount = 0
        params[:ingredients].each_with_index do |next_ingredient, index|
            ingredient_id = next_ingredient[:id]

			# == identify if ingredient is new
			if next_ingredient[:new_delete] == "NEW"
				puts "*** NEW INGREDIENT ***"
				Ingredient.create(:recipe_id => next_ingredient[:recipe_id], :ingredient => next_ingredient[:ingredient], :sequence => next_ingredient[:sequence])
				addIngredientCount = addIngredientCount + 1

			# == identify if ingredient is flagged for delete
			elsif next_ingredient[:new_delete] == "DELETE"
				puts "*** DELETE INGREDIENT ***"
				ingredient = Ingredient.find(ingredient_id)
				ingredient.destroy
				deleteIngredientCount = deleteIngredientCount + 1

			# == update existing ingredient text and sequence
			else
				puts "*** UPDATE ingredient ***"
				ingredient = Ingredient.find(ingredient_id)
				if !ingredient.update(:ingredient => next_ingredient[:ingredient], :sequence => next_ingredient[:sequence])
					ingredient_fails_array.push(ingredient_id)
					puts "*** INGREDIENT UPDATE ERROR"
				end
			end
        end

		# == update instructions
		addInstructionCount = 0
		deleteInstructionCount = 0
        params[:instructions].each do |next_instruction|
            instruction_id = next_instruction[:id]

			# == identify if ingredient is new
			if next_instruction[:new_delete] == "NEW"
				puts "*** NEW INSTRUCTION ***"
				Instruction.create(:recipe_id => next_instruction[:recipe_id], :instruction => next_instruction[:instruction], :sequence => next_instruction[:sequence])

			# == identify if instruction is flagged for delete
			elsif next_instruction[:new_delete] == "DELETE"
				puts "*** DELETE INSTRUCTION ***"
				instruction = Instruction.find(instruction_id)
				instruction.destroy
				deleteInstructionCount = deleteInstructionCount + 1

			# == update existing instruction text and sequence
			else
				puts "*** UPDATE instruction ***"
				instruction = Instruction.find(instruction_id)
				if !instruction.update(:instruction => next_instruction[:instruction], :sequence => next_instruction[:sequence])
					instruction_fails_array.push(instruction_id)
					puts "*** INSTRUCTION UPDATE ERROR"
				end
			end
        end

		if deleteIngredientCount > 0
			if deleteIngredientCount == 1
				message = message + "1 ingredient was removed "
			else
				message = message + deleteIngredientCount.to_s + " ingredients were removed "
			end
			if deleteInstructionCount > 0
				if deleteInstructionCount == 1
					message = message + "and 1 instruction was removed from the recipe. "
				else
					message = message + "and " + deleteInstructionCount.to_s + " instructions were removed from the recipe. "
				end
			else
				message = message + "from the recipe. "
			end
		else
			if deleteInstructionCount > 0
				if deleteInstructionCount == 1
					message = message + "1 instruction was removed from the recipe. "
				else
					message = message + deleteInstructionCount.to_s + " instructions were removed from the recipe. "
				end
			end
		end

		if ingredient_fails_array.length > 0 || instruction_fails_array.length > 0 || recipe_fails_array.length > 0
			message = message + "One or more changes were not saved."
		else
			message = message + "Changes were saved successfully."
		end

		redirect_to({:controller => "home", :action => "show_recipe", :id => params[:recipe_id].to_s}, :notice => message)
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
		existing_recipes_flag = false
		existing_recipes_text = ""
		import_data_array = []
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
				puts "current_user[:id]: #{current_user[:id]}"
				@recipe = Recipe.create(:title => title, :user_id => current_user[:id])
		        if @recipe.save
					puts "RECIPE SAVED"
					recipe_count = recipe_count + 1

					recipe_id = @recipe.id
					import_data_array.push(recipe_id)

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
						error_message = error_count.to_s + " ingredients or instructions were not saved properly.  Select recipe and edit to fix."
					end
				end

			# == recipe with same title exists (no data saved)
			else
				puts "RECIPE EXISTS"
				recipe_id = recipe[0][:id]
				existing_recipes_flag = true
				import_data_array.push(recipe_id)
				if existing_recipes_text == ""
					existing_recipes_text = existing_recipes_text + title + "(" + recipe_id.to_s + ")"
				else
					existing_recipes_text = existing_recipes_text + ", " + title + "(" + recipe_id.to_s + ")"
				end

			end

			if existing_recipes_text != ""
				message = "These recipes already exist: " + existing_recipes_text + "."
				if error_count > 0
					message = message  + "Also, " + error_message
				end
			else
				if recipe_count > 0
					message = recipe_count.to_s + " recipes were added to your recipe collection. "
				elsif recipe_count == 1
					message = recipe_count.to_s + " recipe was added to your recipe collection. "
				end
				if error_count > 0
					message = message  + "Also, " + error_message
				end
			end
		end
		import_data_array.push(message)
		puts "message: " + message
		get_recipe_data("import", import_data_array)

		# respond_to do |format|
		# 	format.json {
		# 		render :json => {:message => message, :existing_recipes_flag => existing_recipes_flag}
		# 	}
		# end
    end

	# ======= ======= ======= UTILITIES ======= ======= =======
    # ======= ======= ======= UTILITIES ======= ======= =======
    # ======= ======= ======= UTILITIES ======= ======= =======

	# ======= make_rating_object =======
	def make_rating_object
		puts "\n******* make_rating_object *******"

		ratingColors = ["#03045e", "#023e8a", "#0077b6", "#0096c7", "#00b4d8", "#48cae4", "#90e0ef", "#ade8f4", "#caf0f8"];
		rating_obj = {}

		if @ratings.length > 0
			@ratings.each_with_index do |next_rating, index|
				rating_data = {:id => nil, :rating => nil, :color => nil}
				ratingNumberText = [next_rating.rating, next_rating.comment]
				rating_data[:id] = next_rating.id
				rating_data[:rating] = ratingNumberText
				rating_data[:color] = ratingColors[index]
				rating_obj[next_rating.id] = rating_data
			end
		end
		return rating_obj
	end

	# ======= make_category_object =======
	def make_category_object
		puts "\n******* make_category_object *******"

		categoryColors = ["#54478cff", "#2c699aff", "#048ba8ff", "#0db39eff", "#16db93ff", "#83e377ff", "#b9e769ff", "#efea5aff", "#f1c453ff", "#f29e4cff"];
		category_obj = {}

		if @categories.length > 0
			@categories.each_with_index do |next_category, index|
				category_data = {:id => nil, :category => nil, :color => nil}
				category_data[:id] = next_category.id
				category_data[:category] = next_category.category
				category_data[:color] = categoryColors[index]
				category_obj[next_category.id] = category_data
			end
		end
		return category_obj
	end

	# ======= make_nationality_object =======
	def make_nationality_object
		puts "\n******* make_nationality_object *******"

		nationalityColors = ["#54478c", "#2c699a", "#048ba8", "#0db39e", "#16db93", "#83e377", "#b9e769", "#efea5a", "#f1c453", "#f29e4c"];
		nationality_obj = {}

		if @nationalities.length > 0
			@nationalities.each_with_index do |next_nationality, index|
				nationality_data = {:id => nil, :nationality => nil, :color => nil}
				nationality_data[:id] = next_nationality.id
				nationality_data[:nationality] = next_nationality.nationality
				nationality_data[:color] = nationalityColors[index]
				nationality_obj[next_nationality.id] = nationality_data
			end
		end
		return nationality_obj
	end

	# ======= ======= ======= PRIVATE ======= ======= =======
    # ======= ======= ======= PRIVATE ======= ======= =======
    # ======= ======= ======= PRIVATE ======= ======= =======

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
