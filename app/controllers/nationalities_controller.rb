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
		puts "params: #{params}"

		nationality_text = @nationality[:nationality]

		recipes = Recipe.where(:nationality_id => params[:id])

		recipes.each do |next_recipe|
			puts "next_recipe.inspect: #{next_recipe.inspect}"
			next_recipe.update(:nationality_id => nil)
		end

		@nationality.destroy
		message = "Nationality " + nationality_text + " was successfully removed."
		respond_to do |format|
			format.html { redirect_to nationalities_url, notice: message }
		end
	end


  # GET /nationalities/1
  # GET /nationalities/1.json
  def show
  end

  # GET /nationalities/1/edit
  def edit
  end

  # POST /nationalities
  # POST /nationalities.json
  def create
    @nationality = Nationality.new(nationality_params)

    respond_to do |format|
      if @nationality.save
        format.html { redirect_to @nationality, notice: 'Nationality was successfully created.' }
        format.json { render :show, status: :created, location: @nationality }
      else
        format.html { render :new }
        format.json { render json: @nationality.errors, status: :unprocessable_entity }
      end
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
