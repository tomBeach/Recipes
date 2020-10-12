class ApplicationController < ActionController::Base
	protect_from_forgery with: :exception
    before_action :getRecipeTypes
	before_action :authenticate_user!, except: :home
    before_action :configure_permitted_parameters, if: :devise_controller?

	Webpacker.compiler.compile

	def getRecipeTypes
		puts "\n******* getRecipeTypes *******"
		@categories = Category.all
		@nationalities = Nationality.all
	end

    protected
	    def configure_permitted_parameters
			devise_parameter_sanitizer.permit(:sign_in) do |u|
				u.permit({ roles: [] }, :username, :password, :remember_me)
			end

			devise_parameter_sanitizer.permit(:sign_up) do |u|
				u.permit({ roles: [] }, :firstname, :lastname, :username, :password, :password_confirmation, :email)
		  	end

		  	devise_parameter_sanitizer.permit(:account_update) do |u|
		  		u.permit({ roles: [] }, :firstname, :lastname, :username, :current_password, :password, :password_confirmation, :email)
		  	end
	    end
end
