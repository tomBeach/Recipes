class AddSequenceToInst < ActiveRecord::Migration[6.0]
	def change
		add_column :instructions, :sequence, :integer
	end
end
