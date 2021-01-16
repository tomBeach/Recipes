class Category < ApplicationRecord
	belongs_to :recipe, optional: true
end
