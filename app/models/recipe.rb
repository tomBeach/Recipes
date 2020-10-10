class Recipe < ApplicationRecord
	has_many :ingredients, dependent: :destroy
	has_many :instructions, dependent: :destroy
	has_one :category
end
