class User < ApplicationRecord
	# Include default devise modules. Others available are:
	# :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
	devise :database_authenticatable, :registerable, :recoverable, :rememberable, :validatable
	has_many :user_ratings, dependent: :destroy
	has_many :recipes, through: :user_ratings
end
