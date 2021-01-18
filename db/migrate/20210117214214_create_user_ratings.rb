class CreateUserRatings < ActiveRecord::Migration[6.0]
  def change
    create_table :user_ratings do |t|
      t.references :user, null: false, foreign_key: true
      t.references :recipe, null: false, foreign_key: true
	  t.integer :rating_id

      t.timestamps
    end
  end
end
