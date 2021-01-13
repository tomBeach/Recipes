Rails.application.routes.draw do

	# == devise
	devise_for :users
	devise_scope :user do
		get '/users/sign_out' => 'devise/sessions#destroy'
	end

	# == home
    get "/" => "home#index"
    get "/home" => "home#index"

	# == groups
	resources :ratings
	resources :categories
	resources :nationalities

	# == groups
	post "/new_nationality" => "nationalities#new_nationality"
	post "/update_nationality" => "nationalities#update_nationality"

	# == recipe files
	get "/import_recipes" => "home#import_recipes"
	post "/save_recipe_file" => "home#save_recipe_file"

	# == search recipes
	post "/search_text" => "home#search_text"
	post "/search_rating" => "home#search_rating"
	post "/search_category" => "home#search_category"
	post "/search_nationality" => "home#search_nationality"

	# == manage recipes
	post "/my_recipes" => "home#my_recipes"
	post "/all_recipes" => "home#all_recipes"
	post "/save_recipe_edits" => "home#save_recipe_edits"
	get "/delete_recipe/:id" => "home#delete_recipe"
	get "/show_recipe/:id" => "home#show_recipe"
	post "/show_recipe/:id" => "home#show_recipe"

end
