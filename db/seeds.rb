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

# == meat, seafood, dessert, soup_stew, vegetarian
Category.destroy_all
Category.create([
 { category:"meat" },
 { category:"seafood" },
 { category:"dessert" },
 { category:"soup/stew" },
 { category:"vegetarian" },
 { category:"appetizer" },
 { category:"breakfast" }
])
@categories = Category.all
puts "@categories: #{@categories.inspect}"
puts "Category.column_names: #{Category.column_names.inspect}"

# ==  Thai,  Indian,  French,  Mexican,  Chinese,  Caribbean,  Middle Eastern,  American
Nationality.destroy_all
Nationality.create([
 { nationality:"Thai" },
 { nationality:"Indian" },
 { nationality:"French" },
 { nationality:"Mexican" },
 { nationality:"Chinese" },
 { nationality:"Caribbean" },
 { nationality:"Middle Eastern" },
 { nationality:"American" },
 { nationality:"Italian" },
 { nationality:"Asian" },
 { nationality:"Spanish" },
 { nationality:"African" }
])
@nationalities = Nationality.all
puts "@nationalities: #{@nationalities.inspect}"
puts "Nationality.column_names: #{Nationality.column_names.inspect}"
