class NationalitiesController < ApplicationController
  before_action :set_nationality, only: [:show, :edit, :update, :destroy]

	# ======= index =======
	def index
		puts "\n******* index *******"
		@nationalities = Nationality.all
	end

	# ======= new_nationality =======
	def new_nationality
		puts "\n******* new_nationality *******"
		puts "params: #{params}"
		@nationality = Nationality.new

		@nationality = Nationality.create(:nationality => params[:new_classify])

		if @nationality.save
			message = params[:new_classify] + " was added to the Nationalities collection."
		end

		respond_to do |format|
			format.json {
				render json: {:message => message}
			}
		end
	end

	# ======= update_nationality =======
	def update_nationality
		puts "\n******* update_nationality *******"
		puts "params: #{params}"

		okay_params = nationality_params()
		nationality = Nationality.find(okay_params[:item_id])
		puts "nationality.inspect: #{nationality.inspect}"

		respond_to do |format|
			if nationality.update(:nationality => params[:nationality])
				message = params[:nationality] + " has been stored as a nationality."
			else
				message = "An error prevented this change: " + params[:nationality] + "."
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
		if current_user[:usertype] == "admin"
			nationality_text = @nationality[:nationality]
			recipes = Recipe.where(:nationality_id => params[:id])
			recipes.each do |next_recipe|
				puts "next_recipe.inspect: #{next_recipe.inspect}"
				next_recipe.update(:nationality_id => nil)
			end
			notice = notice + recipes.length.to_s + " recipies are no longer classified as " + nationality_text
			notice = notice + " because " + nationality_text + " was removed. "
			@nationality.destroy
		else
			notice = notice + "You must be an administrator to delete these classifications."
		end

		respond_to do |format|
			format.html { redirect_to nationalities_url, notice: message }
		end
	end

	private
		# Use callbacks to share common setup or constraints between actions.
		def set_nationality
			@nationality = Nationality.find(params[:id])
		end

		# Only allow a list of trusted parameters through.
		def nationality_params
			puts "\n******* nationality_params *******"
			puts "params.inspect: #{params.inspect}"
			params.permit(:item_id, :nationality)
		end
end
