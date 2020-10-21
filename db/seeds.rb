# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

# == recipe ratings seed
Rating.create([
 { rating:"1", comment:"favorite" },
 { rating:"2", comment:"very good" },
 { rating:"3", comment:"okay" },
 { rating:"4", comment:"not so good" },
 { rating:"5", comment:"desperation only" }
])
@ratings = Rating.all
puts "@ratings: #{@ratings.inspect}"
puts "Rating.column_names: #{Rating.column_names.inspect}"

# # == meat, seafood, dessert, soup_stew, vegetarian
# Category.destroy_all
# Category.create([
#  { category:"meat" },
#  { category:"seafood" },
#  { category:"dessert" },
#  { category:"soup_stew" },
#  { category:"vegetarian" }
# ])
# @categories = Category.all
# puts "@categories: #{@categories.inspect}"
# puts "Category.column_names: #{Category.column_names.inspect}"
#
# # ==  Thai,  Indian,  French,  Mexican,  Chinese,  Caribbean,  Middle Eastern,  American
# Nationality.destroy_all
# Nationality.create([
#  { nationality:"Thai" },
#  { nationality:"Indian" },
#  { nationality:"French" },
#  { nationality:"Mexican" },
#  { nationality:"Chinese" },
#  { nationality:"Caribbean" },
#  { nationality:"Middle Eastern" },
#  { nationality:"American" }
# ])
# @nationalities = Nationality.all
# puts "@nationalities: #{@nationalities.inspect}"
# puts "Nationality.column_names: #{Nationality.column_names.inspect}"
