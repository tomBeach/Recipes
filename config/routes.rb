Rails.application.routes.draw do

	devise_for :users
	devise_scope :user do
		get '/users/sign_out' => 'devise/sessions#destroy'
	end

	# == home
    get "/" => "home#index"
    get "/home" => "home#index"

	# == recipes
	get "/import_recipes" => "home#import_recipes"
	post "/save_recipe_file" => "home#save_recipe_file"
	post "/search_title" => "home#search_title"
	post "/search_ingredient" => "home#search_ingredient"
	post "/search_category" => "home#search_category"
	post "/search_nationality" => "home#search_nationality"
	post "/all_recipes" => "home#all_recipes"
	post "/save_recipe_edits" => "home#save_recipe_edits"
	get "/show_recipe/:id" => "home#show_recipe"

	# == categories
	resources :categories
	resources :nationalities

end
