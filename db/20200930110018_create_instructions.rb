class CreateInstructions < ActiveRecord::Migration[6.0]
  def change
    create_table :instructions do |t|
      t.references :recipe, null: false, foreign_key: true
      t.string :instruction
	  t.integer :sequence

      t.timestamps
    end
  end
end
