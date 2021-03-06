class RatingsController < ApplicationController
before_action :set_rating, only: [:show, :edit, :update, :destroy]

	# ======= index =======
	def index
		puts "\n******* index *******"
		@ratings = Rating.all
		@rating_texts = []
		@ratings.each_with_index do |rating, index|
			rating_text = rating.rating.to_s + ": " + rating.comment
			@rating_texts << [rating_text, rating[:id]]
		end

		if current_user[:usertype] != "admin"
			flash[:notice] = "Note: For now, these categories can only be modified by the site administrator."
		end

	end

	# ======= new_rating =======
	def new_rating
		puts "\n******* new_rating *******"
		puts "params: #{params}"

		ratings_count = Rating.all.length
		new_rating = ratings_count + 1
		@rating = Rating.new

		@rating = Rating.create(:rating => new_rating, :comment => params[:new_classify])

		if @rating.save
			message = new_rating.to_s + ":" + params[:new_classify] + " was added to the Nationalities collection."
		end

		respond_to do |format|
			format.json {
				render json: {:message => message}
			}
		end
	end

	# ======= update_rating =======
	def update_rating
		puts "\n******* update_rating *******"
		puts "params: #{params}"

		okay_params = rating_params()
		rating = Rating.find(okay_params[:item_id])
		puts "rating.inspect: #{rating.inspect}"

		respond_to do |format|
			if rating.update(:comment => okay_params[:rating])
				message = okay_params[:rating] + " has been stored as a rating."
				puts "*** UPDATE OK ***"
			else
				message = "An error prevented this change: " + okay_params[:rating] + "."
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
			rating_text = @rating[:comment]
			recipes = Recipe.where(:rating_id => params[:id])
			recipes.each do |next_recipe|
				puts "next_recipe.inspect: #{next_recipe.inspect}"
				next_recipe.update(:rating_id => nil)
			end
			notice = notice + recipes.length.to_s + " recipies are no longer classified as " + rating_text
			notice = notice + " because " + rating_text + " was removed. "
			@rating.destroy
		else
			notice = notice + "You must be an administrator to delete these classifications."
		end

		respond_to do |format|
		  format.html { redirect_to ratings_url, notice: notice }
		end
	end

	private
		# Use callbacks to share common setup or constraints between actions.
		def set_rating
		@rating = Rating.find(params[:id])
		end

		# Only allow a list of trusted parameters through.
		def rating_params
			puts "\n******* rating_params *******"
			puts "params.inspect: #{params.inspect}"
			params.permit(:item_id, :rating)
		end
end
