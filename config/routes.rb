Rails.application.routes.draw do

	root 'home#index'

	# == devise
	devise_for :users, controllers: {
		sessions: 'users/sessions'
	}

	# == mgmt
    get "/" => "home#index"
    get "/home" => "home#index"
	get "/profile" => "home#profile"
	get "/type_recipe" => "home#type_recipe"

	# == groups
	resources :ratings, only: [:index, :destroy]
	resources :categories, only: [:index, :destroy]
	resources :nationalities, only: [:index, :destroy]

	# == groups
	post "/new_rating" => "ratings#new_rating"
	post "/update_rating" => "ratings#update_rating"
	post "/new_category" => "categories#new_category"
	post "/update_category" => "categories#update_category"
	post "/new_nationality" => "nationalities#new_nationality"
	post "/update_nationality" => "nationalities#update_nationality"

	# == recipe files
	get "/import_recipes" => "home#import_recipes"
	post "/save_recipe_file" => "home#save_recipe_file"

	# == search recipes
	post "/search_recipes" => "home#search_recipes"
	# post "/my_recipes" => "home#my_recipes"
	# post "/all_recipes" => "home#all_recipes"
	post "/search_text" => "home#search_text"
	post "/search_rating" => "home#search_rating"
	post "/search_category" => "home#search_category"
	post "/search_nationality" => "home#search_nationality"
	post "/search_selected" => "home#search_selected"

	# == manage recipes
	post "/save_recipe_edits" => "home#save_recipe_edits"
	get "/delete_recipe/:id" => "home#delete_recipe"
	get "/show_recipe/:id" => "home#show_recipe"

end
