class Nationality < ApplicationRecord
	belongs_to :recipe, optional: true
end
