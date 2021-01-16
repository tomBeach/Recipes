class Rating < ApplicationRecord
	belongs_to :recipe, optional: true
end
