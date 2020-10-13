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
	post "/search_titles" => "home#search_titles"
	post "/search_ingredients" => "home#search_ingredients"
	post "/search_category" => "home#search_category"
	post "/search_nationality" => "home#search_nationality"
	post "/get_recipes" => "home#get_recipes"
	post "/save_recipe" => "home#save_recipe"
	get "/show_recipe/:id" => "home#show_recipe"

	# == categories
	resources :categories
	resources :nationalities

end
