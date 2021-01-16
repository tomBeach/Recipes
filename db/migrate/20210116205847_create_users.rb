class CreateUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :new_users do |t|
      t.string :firstname
      t.string :lastname
      t.string :username
      t.string :usertype

      t.timestamps
    end
  end
end