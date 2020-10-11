# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

Category.destroy_all
Category.create([
 { category:"meat" },
 { category:"seafood" },
 { category:"dessert" },
 { category:"soup_stew" },
 { category:"vegetarian" }
])
@categories = Category.all
puts "@categories: #{@categories.inspect}"
puts "Category.column_names: #{Category.column_names.inspect}"

Nationality.destroy_all
Nationality.create([
 { nationality:"Thai" },
 { nationality:"Indian" },
 { nationality:"French" },
 { nationality:"Mexican" },
 { nationality:"Chinese" },
 { nationality:"Caribbean" },
 { nationality:"Middle Eastern" },
 { nationality:"American" }
])
@nationalities = Nationality.all
puts "@nationalities: #{@nationalities.inspect}"
puts "Nationality.column_names: #{Nationality.column_names.inspect}"
