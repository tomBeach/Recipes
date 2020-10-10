class AddSequenceToIngr < ActiveRecord::Migration[6.0]
	def change
		add_column :ingredients, :sequence, :integer
	end
end
