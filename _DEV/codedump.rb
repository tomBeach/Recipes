




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
