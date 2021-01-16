class CategoriesController < ApplicationController
  before_action :set_category, only: [:show, :edit, :update, :destroy]

	# ======= index =======
	def index
		puts "\n******* index *******"
		@categories = Category.all
	end

	# ======= new_category =======
	def new_category
		puts "\n******* new_category *******"
		puts "params: #{params}"
		@category = Category.new

		@category = Category.create(:category => params[:new_classify])

		if @category.save
			message = params[:new_classify] + " was added to the Nationalities collection."
		end

		respond_to do |format|
			format.json {
				render json: {:message => message}
			}
		end
	end

	# ======= update_category =======
	def update_category
		puts "\n******* update_category *******"
		puts "params: #{params}"

		okay_params = category_params()
		category = Category.find(okay_params[:item_id])
		puts "category.inspect: #{category.inspect}"

		respond_to do |format|
			if category.update(:category => params[:category])
				message = params[:category] + " has been stored as a category."
			else
				message = "An error prevented this change: " + params[:category] + "."
			end
			format.json {
				render json: {:message => message}
			}
		end
	end

	# ======= destroy =======
	def destroy
		puts "\n******* destroy *******"

		notice = ""
		if current_user[:id] == 2
			category_text = @category[:category]
			recipes = Recipe.where(:category_id => params[:id])
			recipes.each do |next_recipe|
				puts "next_recipe.inspect: #{next_recipe.inspect}"
				next_recipe.update(:category_id => nil)
			end
			notice = notice + recipes.length.to_s + " recipies are no longer classified as " + category_text
			notice = notice + " because " + category_text + " was successfully destroyed. "
		    @category.destroy
		else
			notice = notice + "You must be an administrator to delete these classifications."
		end

		respond_to do |format|
		  format.html { redirect_to categories_url, notice: notice }
		end
	end

	private
		# Use callbacks to share common setup or constraints between actions.
		def set_category
			puts "\n******* set_category *******"
			@category = Category.find(params[:id])
		end

		# Only allow a list of trusted parameters through.
		def category_params
			puts "\n******* category_params *******"
			puts "params.inspect: #{params.inspect}"
			params.permit(:item_id, :category)
		end
end
