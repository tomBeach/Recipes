// ======= searchRecipes =======
function searchRecipes(searchString, searchType) {
	console.log("== searchRecipes ==");
	console.log("searchString: ", searchString);
	console.log("searchType: ", searchType);

	switch (searchType) {
		case title:
		var url = "/search_title";
		break;
		case ingredient:
		var url = "/search_ingredient";
		break;
		case category:
		var url = "/search_category";
		break;
		case nationality:
		var url = "/search_nationality";
		break;
	}

	var jsonData = JSON.stringify(searchString);

	$.ajax({
		url: url,
		data: jsonData,
		method: "POST",
		dataType: "json",
		contentType: "application/json; charset=utf-8"
	}).done(function(jsonData) {
		console.log("*** ajax success ***");
		console.dir(jsonData)
		displayRecipeTitles(jsonData)
		makeTitleText(jsonData, searchType);
		updateNoticeMessage(jsonData);
	}).fail(function(unknown){
		console.log("*** ajax fail ***");
		console.log("unknown:", unknown);
	});
}

// ======= searchIngredients =======
function searchIngredients(searchString, searchType) {
	console.log("== searchIngredients ==");
	console.log("searchString: ", searchString);

	var url = "/search_ingredient";
	var jsonData = JSON.stringify(searchString);

	$.ajax({
		url: url,
		data: jsonData,
		method: "POST",
		dataType: "json",
		contentType: "application/json; charset=utf-8"
	}).done(function(jsonData) {
		console.log("*** ajax success ***");
		console.dir(jsonData)
		displayRecipeTitles(jsonData)
		makeTitleText(jsonData, "ingredient");
		updateNoticeMessage(jsonData);
	}).fail(function(unknown){
		console.log("*** ajax fail ***");
		console.log("unknown:", unknown);
	});
}

// ======= searchCategory =======
function searchCategory(searchString, searchType) {
	console.log("== searchCategory ==");
	console.log("searchString: ", searchString);

	var url = "/search_category";
	var jsonData = JSON.stringify(searchString);

	$.ajax({
		url: url,
		data: jsonData,
		method: "POST",
		dataType: "json",
		contentType: "application/json; charset=utf-8"
	}).done(function(jsonData) {
		console.log("*** ajax success ***");
		console.dir(jsonData)
		displayRecipeTitles(jsonData)
		makeTitleText(jsonData, "category");
		updateNoticeMessage(jsonData);
	}).fail(function(unknown){
		console.log("*** ajax fail ***");
		console.log("unknown:", unknown);
	});
}

// ======= searchNationality =======
function searchNationality(searchString, searchType) {
	console.log("== searchNationality ==");

	var url = "/search_nationality";
	var jsonData = JSON.stringify(searchString);

	$.ajax({
		url: url,
		data: jsonData,
		method: "POST",
		dataType: "json",
		contentType: "application/json; charset=utf-8"
	}).done(function(jsonData) {
		console.log("*** ajax success ***");
		console.dir(jsonData)
		displayRecipeTitles(jsonData)
		makeTitleText(jsonData, "nationality");
		updateNoticeMessage(jsonData);
	}).fail(function(unknown){
		console.log("*** ajax fail ***");
		console.log("unknown:", unknown);
	});
}
