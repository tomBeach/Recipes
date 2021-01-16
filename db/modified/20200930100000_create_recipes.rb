class CreateRecipes < ActiveRecord::Migration[6.0]
  def change
    create_table :recipes do |t|
      t.string :title
      t.integer :user_id
      t.integer :rating_id
      t.integer :category_id
      t.integer :nationality_id
      t.boolean :shared

      t.timestamps
    end
  end
end
