class Users::SessionsController < Devise::SessionsController

	# GET /resource/sign_in
	def new
		puts "\n******* devise: new *******"
		super
	end

	# POST /resource/sign_in
	def create
		puts "\n******* devise: create *******"
		super
	end

	# DELETE /resource/sign_out
	def destroy
		puts "\n******* devise: destroy *******"
		super
		cookies.delete :json_click_trail
	end
end
