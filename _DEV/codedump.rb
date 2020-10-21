<%# ======= category and nationality options ======= %>
<% category_ids = [] %>
<% @categories.each_with_index do |category, index| %>
    <% category_ids << [category.category, category[:id]] %>
<% end %>

<% nationality_ids = [] %>
<% @nationalities.each_with_index do |nationality, index| %>
    <% nationality_ids << [nationality.nationality, nationality[:id]] %>
<% end %>


<%# ======= selected category / nationality ======= %>
<% puts "@recipe.category_id: #{@recipe.category_id}" %>
<% if @recipe.category_id == nil %>
	<% puts "no category" %>
	<% category_ids.push(["no category", nil]) %>
	<% category = ["no category", nil] %>
	<% @recipe.category_id = 0 %>
<% else %>
	<% category = @recipe.category_id %>
<% end %>
<% puts "category_ids: #{category_ids}" %>

<% puts "@recipe.nationality_id: #{@recipe.nationality_id}" %>
<% if @recipe.nationality_id == nil %>
	<% nationality_ids.push(["no nationality", nil]) %>
	<% nationality = ["no nationality", nil] %>
	<% @recipe.nationality_id = 0 %>
<% else %>
	<% nationality = @recipe.nationality_id %>
<% end %>
<% puts "nationality_ids: #{nationality_ids}" %>





function autoSequence() {
	console.log("== autoSequence ==");

	var nextId, nextSequence;

	// == get database record stored in local div (data value)
	var ingredientsData = $('#ingredientsData').data();
	var instructionsData = $('#instructionsData').data();

	// == number ingredients automatically
	for (var i = 0; i < ingredientsData.ingredients.length; i++) {
		nextSeq = i + 1;
		nextId = ingredientsData.ingredients[i].id;
		nextSequence = parseInt($('#ingrSeq_' + nextId).val());
		$('#ingrSeq_' + nextId).val(nextSeq);
		ingredientsData.ingredients[i].sequence = nextSeq;
	}

	// == number ingredients automatically
	for (var j = 0; j < instructionsData.instructions.length; j++) {
		nextSeq = j + 1;
		nextId = instructionsData.instructions[j].id;
		nextSequence = parseInt($('#instSeq_' + nextId).val());
		$('#instSeq_' + nextId).val(nextSeq);
		instructionsData.instructions[j].sequence = nextSeq;
	}
}






<div class="field">
  <%= f.label :email %><br />
  <%= f.email_field :email, autofocus: true, autocomplete: "email" %>
</div>

<div class="field">
  <%= f.label :password %><br />
  <%= f.password_field :password, autocomplete: "current-password" %>
</div>

<% if devise_mapping.rememberable? %>
  <div class="field">
	<%= f.check_box :remember_me %>
	<%= f.label :remember_me %>
  </div>
<% end %>

<div class="actions">
  <%= f.submit "Log in" %>
</div>





<div class="field">
  <%= f.label :email %><br />
  <%= f.email_field :email, autofocus: true, autocomplete: "email" %>
</div>

<div class="field">
  <%= f.label :password %>
  <% if @minimum_password_length %>
  <em>(<%= @minimum_password_length %> characters minimum)</em>
  <% end %><br />
  <%= f.password_field :password, autocomplete: "new-password" %>
</div>

<div class="field">
  <%= f.label :password_confirmation %><br />
  <%= f.password_field :password_confirmation, autocomplete: "new-password" %>
</div>

<div class="actions">
  <%= f.submit "Sign up" %>
</div>
