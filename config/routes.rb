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
	post "/search_recipes" => "home#search_recipes"
	post "/search_ingredients" => "home#search_ingredients"
	post "/search_type" => "home#search_type"
	post "/get_recipes" => "home#get_recipes"
	post "/save_recipe" => "home#save_recipe"
	get "/show_recipe/:id" => "home#show_recipe"

	# == categories
	resources :categories

	# == data
	post "/save_json_data" => "home#save_json_data"
	get "/add_json_data" => "home#add_json_data"

end
