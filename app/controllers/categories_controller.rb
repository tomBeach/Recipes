class CategoriesController < ApplicationController
  before_action :set_category, only: [:show, :edit, :update, :destroy]

	# ======= index =======
	# GET /categories
	def index
		puts "\n******* index *******"
		@categories = Category.all
	end

	# ======= new =======
	# GET /categories/new
	def new
		@category = Category.new
	end

	# ======= create =======
	# POST /categories
	def create
		puts "\n******* create *******"
		puts "params.inspect: #{params.inspect}"
		puts "params[:category][:recipe_type]: #{params[:category][:recipe_type]}"

		@category = Category.new(category_params)

        respond_to do |format|
            if @category.save
				puts "*** SAVED"
                format.html { redirect_to @category, notice: 'Category was successfully created.' }
            else
				puts "*** FAIL"
                format.html { render :new }
            end
        end


		# okay_params = category_params
		# puts "okay_params.inspect: #{okay_params.inspect}"
		# puts "okay_params[:recipe_type]: #{okay_params[:recipe_type]}"
		#
		# @category = Category.create(:recipe_type => okay_params[:recipe_type])
		# puts "@category.inspect: #{@category.inspect}"
		# category_check = @category.find.last
		#
		# respond_to do |format|
		# 	if @category.find.last
		# 		puts "*** SAVED"
		# 		# format.html { redirect_to @category, notice: 'Category was successfully created.' }
		# 		format.html { "redirect_to @category, notice: 'Category was successfully created.'" }
		# 	else
		# 		puts "*** FAIL"
		# 		format.html { render :new, notice: 'There was a problem in saving the category.'  }
		# 	end
		# end
	end

  # GET /categories/1
  # GET /categories/1.json
  def show
  end

  # GET /categories/1/edit
  def edit
  end

  # PATCH/PUT /categories/1
  # PATCH/PUT /categories/1.json
  def update
    respond_to do |format|
      if @category.update(category_params)
        format.html { redirect_to @category, notice: 'Category was successfully updated.' }
        format.json { render :show, status: :ok, location: @category }
      else
        format.html { render :edit }
        format.json { render json: @category.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /categories/1
  # DELETE /categories/1.json
  def destroy
    @category.destroy
    respond_to do |format|
      format.html { redirect_to categories_url, notice: 'Category was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
	# Use callbacks to share common setup or constraints between actions.
	def set_category
		@category = Category.find(params[:id])
	end

	# Only allow a list of trusted parameters through.
	def category_params
		puts "\n******* category_params *******"
		puts "params.inspect: #{params.inspect}"
		puts "params[:category]: #{params[:category]}"
		puts "params[:category][:recipe_type]: #{params[:category][:recipe_type]}"
		params.require(:category).permit(:recipe_type)
	end
end
