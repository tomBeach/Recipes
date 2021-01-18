class Recipe < ApplicationRecord
	has_many :ingredients, dependent: :destroy
	has_many :instructions, dependent: :destroy
	has_one :rating
	has_one :category
	has_one :nationality
	has_many :user_ratings, dependent: :destroy
	has_many :users, through: :user_ratings
end
