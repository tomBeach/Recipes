class CategoriesController < ApplicationController
  before_action :set_category, only: [:show, :edit, :update, :destroy]

	# ======= index =======
	def index
		puts "\n******* index *******"
		@categories = Category.all
	end

	# ======= new =======
	def new
		puts "\n******* new *******"
		@category = Category.new
		puts "@category.inspect: #{@category.inspect}"
	end

	# ======= create =======
	def create
		puts "\n******* create *******"
		puts "params.inspect: #{params.inspect}"

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
	end

	# ======= show =======
	def show
		puts "\n******* show *******"
		puts "params.inspect: #{params.inspect}"
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
			puts "\n******* set_category *******"
			@category = Category.find(params[:id])
		end

		# Only allow a list of trusted parameters through.
		def category_params
			puts "\n******* category_params *******"
			puts "params.inspect: #{params.inspect}"
			params.require(:category).permit(:category)
		end
end
