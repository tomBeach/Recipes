$(document).on('turbolinks:load', function() {
    console.log("== turbolinks:load ==");

	var sortableIngr, sortableIngrLines;

    // ======= check pathname =======
    var pathname = window.location.pathname;
	var pathParts = pathname.split("/");
    var pathPartsCount = (pathname.split("/").length - 1);
	console.log("pathParts: ", pathParts);

	// ======= window conditionals =======
    if (pathname == "/import_recipes") {
		loadFileReader();
	} else {
		if (pathParts[1] == "show_recipe") {
			// sortableIngr = $('#ingredients').sortable();
			// sortableIngrLines = $('#ingredients').children('div').children('p');

			$('#ingredients').sortable({
				start: function (event, ui) {
					console.log("== start ==");
					console.log("event: ", event);
					console.log("ui.item: ", ui.item);
					console.log("ui.item.index(): ", ui.item.index());
					$(ui.item).data("startindex", ui.item.index());
					console.log("$(ui.item).data: ", $(ui.item).data);
				},
				stop: function (event, ui) {
					console.log("== stop ==");
					console.log("event: ", event);
					self.sendUpdatedIndex(ui.item);
				}
			}).disableSelection();

			self.sendUpdatedIndex = function ($item) {
				console.log("== sendUpdatedIndex ==");
			    var startIndex = $item.data("startindex") + 1;
			    var newIndex = $item.index() + 1;
			    if (newIndex != startIndex) {
					var itemIndexData = { id: $item.attr("id"), oldPosition: startIndex, newPosition: newIndex };
					console.log("itemIndexData: ", itemIndexData);
			    }
			}

			// for (var i = 0; i < sortableIngrLines.length; i++) {
			// 	console.log("...text: ", sortableIngrLines[i].innerText);
			// }
			//
			// sortableIngr.on("mouseup", function() {
			// 	console.log("== sortableIngr: sortchange ==");
			// 	updateSequenceValues("Ingr");
			// });

			activateEditLinks();
		} else if (pathParts[1] == "nationalities") {
			activateNationalities();
		}
	}
	activateMainMenu();


	// ======= updateSequenceValues =======
	function updateSequenceValues(whichList) {
		console.log("== updateSequenceValues ==");

		var ingrArray = $('#ingredients').sortable('toArray');
		console.log("ingrArray: ", ingrArray);
		var ingrArray = $('#ingredients > div > p').sortable('toArray');
		console.log("ingrArray: ", ingrArray);

		console.log("whichList: ", whichList);
		console.log("sortableIngr: ", sortableIngr);
		console.log("sortableIngr.children()[0]: ", sortableIngr.children()[0]);
		console.log("sortableIngrLines[0]: ", sortableIngrLines[0]);

		// var ingredientsList = $('#ingredients').children('.recipeLine').children('p');
		// console.log("ingredientsList: ", ingredientsList);
		// console.log("ingredientsList[0]: ", ingredientsList[0]);
	}

	// ======= editPopup =======
	function editPopup() {
		console.log("== editPopup ==");
		$(".popup-overlay, .popup-content").addClass("active");
	}

	$(".close, .popup").on("click", function(){
		$(".popup-overlay, .popup-content").removeClass("active");
	});


	// ======= initialize variables =======
	var recipesArray = [];
	var editFlag = false;


	// ======= ======= ======= MENU ======= ======= =======
	// ======= ======= ======= MENU ======= ======= =======
	// ======= ======= ======= MENU ======= ======= =======

	// ======= activateCheckEdit =======
    function activateCheckEdit() {
		console.log("== activateCheckEdit ==");
		$('.checkEdit').on('click', editPopup);
	}

	// ======= activateMainMenu =======
    function activateMainMenu() {
		console.log("== activateMainMenu ==");

		$('#getAllRecipes').click(function(e) {
			console.log("== click: getAllRecipes ==");
			e.preventDefault();
			if (editFlag == false) {
				// $('#rating_select').val(0);			// set to no selection
				// $('#category_select').val(0);		// set to no selection
				// $('#nationality_select').val(0);	// set to no selection
				toggleEditButtons("hide");
				searchRecipes("", "all");
			} else {
				editPopup();
			}
			e.stopPropagation();
		});

		$('#searchTitles').click(function(e) {
			console.log("== click: searchTitles ==");
			e.preventDefault();
			if (editFlag == false) {
				// $('#rating_select').val(0);			// set to no selection
				// $('#category_select').val(0);		// set to no selection
				// $('#nationality_select').val(0);	// set to no selection
				toggleEditButtons("hide");
				var searchString = $('#search').val();
				if (searchString.length == 0) {
					makeTitleText("", "no search");
				} else {
					searchRecipes(searchString, "title");
				}
			} else {
				editPopup();
			}
	    });

		$('#searchIngredients').click(function(e) {
			console.log("== click: searchIngredients ==");
			e.preventDefault();
			if (editFlag == false) {
				// $('#rating_select').val(0);			// set to no selection
				// $('#category_select').val(0);		// set to no selection
				// $('#nationality_select').val(0);		// set to no selection
				toggleEditButtons("hide");
				var searchString = $('#search').val();
				if (searchString.length == 0) {
					makeTitleText("", "no search");
				} else {
					searchRecipes(searchString, "ingredient");
				}
			} else {
				editPopup();
			}
	    });

		$('#rating_select').change(function(e) {
			console.log("== change: rating_select ==");
			e.preventDefault();
			if (editFlag == false) {
				$('#rating_select').removeClass('neutral');		// set to active color
				$('#category_select').val(null);				// set to no selection
				$('#nationality_select').val(null);				// set to no selection
				$('#category_select').addClass('neutral');		// set to neutral color
				$('#nationality_select').addClass('neutral');	// set to neutral color
				toggleEditButtons("hide");
				var searchString = $('#rating_select option:selected').val();
				if (searchString.length == 0) {
					makeTitleText("", "no search");
				} else {
					searchRecipes(searchString, "rating");
				}
			} else {
				editPopup();
			}
	    });

		$('#category_select').change(function(e) {
			console.log("== change: category_select ==");
			e.preventDefault();
			if (editFlag == false) {
				$('#category_select').removeClass('neutral');	// set to active color
				$('#rating_select').val(null);					// set to no selection
				$('#nationality_select').val(null);				// set to no selection
				$('#rating_select').addClass('neutral');		// set to neutral color
				$('#nationality_select').addClass('neutral');	// set to neutral color
				toggleEditButtons("hide");
				var searchString = $('#category_select option:selected').val();
				if (searchString.length == 0) {
					makeTitleText("", "no search");
				} else {
					searchRecipes(searchString, "category");
				}
			} else {
				editPopup();
			}
	    });

		$('#nationality_select').change(function(e) {
			console.log("== change: nationality_select ==");
			e.preventDefault();
			if (editFlag == false) {
				$('#nationality_select').removeClass('neutral');	// set to active color
				$('#rating_select').val(null);						// set to no selection
				$('#category_select').val(null);					// set to no selection
				$('#rating_select').addClass('neutral');			// set to neutral color
				$('#category_select').addClass('neutral');			// set to neutral color
				toggleEditButtons("hide");
				var searchString = $('#nationality_select option:selected').val();
				if (searchString.length == 0) {
					makeTitleText("", "no search");
				} else {
					searchRecipes(searchString, "nationality");
				}
			} else {
				editPopup();
			}
	    });
	}


	// ======= ======= ======= ALL or SEARCH ======= ======= =======
	// ======= ======= ======= ALL or SEARCH ======= ======= =======
	// ======= ======= ======= ALL or SEARCH ======= ======= =======

	function searchRecipes(searchString, searchType) {
		console.log("== searchRecipes ==");

		switch (searchType) {
			case "all":
			$('#rating_select').val(null);						// set to no selection
			$('#category_select').val(null);					// set to no selection
			$('#nationality_select').val(null);					// set to no selection
			$('#rating_select').addClass('neutral');			// set to neutral color
			$('#category_select').addClass('neutral');			// set to neutral color
			$('#nationality_select').addClass('neutral');		// set to neutral color
			var url = "/all_recipes";
			break;
			case "title":
			var url = "/search_title";
			break;
			case "ingredient":
			var url = "/search_ingredient";
			break;
			case "rating":
			var url = "/search_rating";
			break;
			case "category":
			var url = "/search_category";
			break;
			case "nationality":
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


	// ======= ======= ======= EDIT ======= ======= =======
	// ======= ======= ======= EDIT ======= ======= =======
	// ======= ======= ======= EDIT ======= ======= =======

	// ======= activateEditLinks =======
    function activateEditLinks() {
		console.log("== activateEditLinks ==");

		var btnColor;
		var textColor;
		var currentText, currentHtml, currentId;

		// == activate mouseovers, button actions for ingredient and instruction text lines
		$('#outputTitle').on('mouseover', hiliteLink);
		$('#outputTitle').on('mouseout', restoreLink);
		$('#outputTitle').on('click', editTitle);
		$('.ingredient, .instruction').on('mouseover', hiliteLink);
		$('.ingredient, .instruction').on('mouseout', restoreLink);
		$('.ingredient, .instruction').on('click', editLink);

		// == recipe line behaviors
		function hiliteLink() {
			// console.log("== hiliteLink ==");
			textColor = $(this).css('color');
			$(this).css('color', 'red');
		}
		function restoreLink() {
			// console.log("== restoreLink ==");
			$(this).css('color', textColor);
		}
		function hiliteBtn() {
			// console.log("== hiliteBtn ==");
			btnColor = $(this).css('background-color');
			$(this).css('background-color', 'red');
		}
		function restoreBtn() {
			// console.log("== restoreBtn ==");
			$(this).css('background-color', btnColor);
		}
		function saveSequence() {
			console.log("== saveSequence ==");
			console.log("$(this).val(): ", $(this).val());
		}

		// == activate main edit options (recipe category, auto sequence, save)
		$('#rating_edit_select').change(function(e) {
			console.log("== change: rating_edit_select ==");
			e.preventDefault();

			// == temporarily store previous value for this item (rating)
			editFlag = true;

			var rating = $('#rating_edit_select option:selected').text();
			var ratingId = $('#rating_edit_select option:selected').val();
			$('#ratingData').data().ratingid = ratingId;
			console.log("$('#ratingData').data(): ", $('#ratingData').data());

			// == activate save and cancel buttons
			$('#saveRecipeEdits').addClass('active');
			$('#cancelRecipeEdits').addClass('active');
	    });

		$('#category_edit_select').change(function(e) {
			console.log("== change: category_edit_select ==");
			e.preventDefault();

			// == temporarily store previous value for this item (category)
			editFlag = true;

			var category = $('#category_edit_select option:selected').text();
			var categoryId = $('#category_edit_select option:selected').val();
			$('#categoryData').data().categoryid = categoryId;
			console.log("$('#categoryData').data(): ", $('#categoryData').data());

			// == activate save and cancel buttons
			$('#saveRecipeEdits').addClass('active');
			$('#cancelRecipeEdits').addClass('active');
	    });

		$('#nationality_edit_select').change(function(e) {
			console.log("== change: nationality_edit_select ==");
			e.preventDefault();

			// == temporarily store previous value for this item (nationality)
			editFlag = true;

			var nationality = $('#nationality_edit_select option:selected').text();
			var nationalityId = $('#nationality_edit_select option:selected').val();
			$('#nationalityData').data().nationalityid = nationalityId;
			console.log("$('#nationalityData').data(): ", $('#nationalityData').data());

			// == activate save and cancel buttons
			$('#saveRecipeEdits').addClass('active');
			$('#cancelRecipeEdits').addClass('active');
	    });

		$('#saveRecipeEdits').click(function(e) {
			console.log("== click: saveRecipeEdits ==");
			e.preventDefault();
			editFlag = false;
			saveRecipeEdits();
			e.stopPropagation();
		});

		$('#cancelRecipeEdits').click(function(e) {
			console.log("== click: cancelRecipeEdits ==");
			e.preventDefault();
			editFlag = false;
			cancelRecipeEdits();
			e.stopPropagation();
		});

		$('#deleteRecipe').click(function(e) {
			console.log("== click: deleteRecipe ==");
			e.preventDefault();
			editFlag = false;
			deleteRecipe($('#recipeId').data().recipeid);
			e.stopPropagation();
		});

		// == edit button behaviors
		function editTitle() {
			console.log("== editTitle ==");

			editFlag = true;

			// == set edit mode parameters for currently selected element
			currentText = $(this).text();

			// == temporarily store previous value for this item (title)
			editFlag = true;

			var inputHtml = "<input type='text' id='editTitle' name='editTitle' value='" + currentText + "'>";
			var btnsHtml = "<div class='saveBtn'> save </div> <div class='cancelBtn'> cancel </div> ";
			var editHtml = inputHtml + btnsHtml;
			$(this).replaceWith(editHtml);
			$('.saveBtn, .cancelBtn').on('mouseover', hiliteBtn);
			$('.saveBtn, .cancelBtn').on('mouseout', restoreBtn);

			$('.saveBtn').click(function(e) {
				e.preventDefault();
				saveTitle();
				e.stopPropagation();
		    });
			$('.cancelBtn').click(function(e) {
				e.preventDefault();
				cancelTitle(currentText);
				e.stopPropagation();
		    });
		}

		function saveTitle() {
			console.log("== saveTitle ==");

			editFlag = false;
			var newText = $('#editTitle').val();

			// == save new value for ajax submit
			$('#titleData').data().title = newText;

			// == update html string with changes
			var saveHtml = "<h2 id='outputTitle'>" + newText + "</h2>";
			$('#editTitle').replaceWith(saveHtml);
			$('.saveBtn, .cancelBtn').remove();

			// == restore line hilites and click behavior
			$('#' + currentId).on('mouseover', hiliteLink);
			$('#' + currentId).on('mouseout', restoreLink);
			$('#' + currentId).on('click', editTitle);
		}

		function cancelTitle(currentText) {
			console.log("== cancelTitle ==");

			editFlag = false;

			// == restore html string
			var saveHtml = "<h2 id='outputTitle'>" + currentText + "</h2>";
			$('#editTitle').replaceWith(saveHtml);
			$('.saveBtn, .cancelBtn').remove();

			// == restore line hilites and click behavior
			$('#outputTitle').on('mouseover', hiliteLink);
			$('#outputTitle').on('mouseout', restoreLink);
			$('#outputTitle').on('click', editTitle);
		}

		// == edit button behaviors
		function editLink() {
			console.log("== editLink ==");

			// == remove/restore existing edit mode elements if any
			if ($('.saveBtn').length > 0) {
				$('.saveBtn, .cancelBtn').remove();
				var saveHtml = "<p class='ingredient' id='" + currentId + "'>" + currentText + "</p>";
				$('#' + currentId).replaceWith(saveHtml);
				$('#' + currentId).on('mouseover', hiliteLink);
				$('#' + currentId).on('mouseout', restoreLink);
				$('#' + currentId).on('click', editLink);
			}

			// == set edit mode parameters for currently selected element
			currentText = $(this).text();
			currentHtml = $(this).html();
			currentId = $(this).attr('id');
			var inputHtml = "<input type='text' class='editItem' id='" + currentId + "' name='" + currentId + "' value='" + currentText + "'>";
			var btnsHtml = "<div class='saveBtn'> save </div> <div class='cancelBtn'> cancel </div> ";
			var editHtml = inputHtml + btnsHtml;
			$(this).replaceWith(editHtml);
			$('.saveBtn, .cancelBtn').on('mouseover', hiliteBtn);
			$('.saveBtn, .cancelBtn').on('mouseout', restoreBtn);
			$('.saveBtn').on('click', saveLineEdits);
			$('.cancelBtn').on('click', cancelLineEdits);

			// == store previous value for cancel option
			editFlag = true;
		}

		function saveLineEdits() {
			console.log("== saveLineEdits ==");

			var nextId, nextSequence;

			// == get database record stored in local div (data value)
			var ingredientsData = $('#ingredientsData').data();
			var instructionsData = $('#instructionsData').data();

			// == currentId format: ingredient_XXXX or instruction_XXXX (XXXX = database id)
			var underscoreIndex = currentId.indexOf("_");
			var modifiedId = currentId.substr(underscoreIndex + 1);		// currentId == selected/active text element
			var newText = $('#' + currentId).val();

			// == save changes to local data
			for (var i = 0; i < ingredientsData.ingredients.length; i++) {
				nextId = ingredientsData.ingredients[i].id;
				nextSequence = parseInt($('#ingrSeq_' + nextId).val());
				ingredientsData.ingredients[i].sequence = nextSequence;
				if (nextId == modifiedId) {
					ingredientsData.ingredients[i].ingredient = newText;
					break;
				}
			}

			// == save changes to local data
			for (var i = 0; i < instructionsData.instructions.length; i++) {
				nextId = instructionsData.instructions[i].id;
				nextSequence = parseInt($('#instSeq_' + nextId).val());
				instructionsData.instructions[i].sequence = nextSequence;
				if (nextId == modifiedId) {
					instructionsData.instructions[i].instruction = newText;
					break;
				}
			}

			// == update html string with changes
			var saveHtml = "<p class='ingredient' id='" + currentId + "'>" + newText + "</p>";
			$('#' + currentId).replaceWith(saveHtml);
			$('.saveBtn, .cancelBtn').remove();

			// == restore line hilites and click behavior
			$('#' + currentId).on('mouseover', hiliteLink);
			$('#' + currentId).on('mouseout', restoreLink);
			$('#' + currentId).on('click', editLink);

			// == activate save and cancel buttons
			$('#saveRecipeEdits').addClass('active');
			$('#cancelRecipeEdits').addClass('active');
		}

		function cancelLineEdits() {
			console.log("== cancelLineEdits ==");
			editFlag = false;
			var saveHtml = "<p class='ingredient' id='" + currentId + "'>" + currentText + "</p>";
			$('#' + currentId).replaceWith(saveHtml);
			$('.saveBtn, .cancelBtn').remove();
			$('#' + currentId).on('mouseover', hiliteLink);
			$('#' + currentId).on('mouseout', restoreLink);
			$('#' + currentId).on('click', editLink);
		}

		function saveRecipeEdits() {
			console.log("== saveRecipeEdits ==");

			editFlag = false;

			var currentId = $('#recipeId').data().recipeid;
			var titleData = $('#titleData').data().title;
			var ratingData = $('#ratingData').data().ratingid;
			var categoryData = $('#categoryData').data().categoryid;
			var nationalityData = $('#nationalityData').data().nationalityid;
			var ingredientsData = $('#ingredientsData').data().ingredients;
			var instructionsData = $('#instructionsData').data().instructions;

			// == avoid null values (items not set by user)
			if (!ratingData.ratingid) {
				ratingData.ratingid = 0;
			}
			if (!categoryData.categoryid) {
				categoryData.categoryid = 0;
			}
			if (!nationalityData.nationalityid) {
				nationalityData.nationalityid = 0;
			}

			var recipeData = {
				recipe_id:currentId,
				title:titleData,
				rating_id:ratingData,
				category_id:categoryData,
				nationality_id:nationalityData,
				ingredients:ingredientsData,
				instructions:instructionsData};

			saveRecipeData(recipeData, "edit")
		}

		function cancelRecipeEdits() {
			console.log("== cancelRecipeEdits ==");
			var prevRatingId = $('#prevValue').data().ratingid;
			var prevCategoryId = $('#prevValue').data().categoryid;
			var prevNationalityId = $('#prevValue').data().nationalityid;
			$('#ratingData').data().ratingid = prevRatingId;
			$('#categoryData').data().categoryid = prevCategoryId;
			$('#nationalityData').data().nationalityid = prevNationalityId;
			$('#rating_edit_select').val(prevRatingId);
			$('#category_edit_select').val(prevCategoryId);
			$('#nationality_edit_select').val(prevNationalityId);
			$("#cancelRecipeEdits").removeClass("active");
		}

		function deleteRecipe(recipeId) {
			console.log("== deleteRecipe ==");
			console.log("recipeId: ", recipeId);

			var url = "/delete_recipe/" + recipeId.toString();

			$.ajax({
			    url: url,
				// data: recipeId,
			    method: "GET",
				dataType: "json",
				contentType: "application/json; charset=utf-8"
			}).done(function(jsonData) {
			    console.log("*** ajax success ***");
			    console.dir(jsonData)
				updateNoticeMessage(jsonData);
			}).fail(function(unknown){
			    console.log("*** ajax fail ***");
				console.log("unknown:", unknown);
			});
		}
	}


	// ======= ======= ======= MGMT ======= ======= =======
	// ======= ======= ======= MGMT ======= ======= =======
	// ======= ======= ======= MGMT ======= ======= =======

	// ======= activateNationalities =======
    function activateNationalities() {
		console.log("== activateNationalities ==");

		$('#newNationalityBtn').click(function(e) {
			console.log("== click: newNationalityBtn ==");
			e.preventDefault();
			makeNewNationality();
			e.stopPropagation();
		});
	}

	function makeNewNationality() {
		console.log("== makeNewNationality ==");

		var btnColor;

		function hiliteBtn() {
			// console.log("== hiliteBtn ==");
			btnColor = $(this).css('background-color');
			$(this).css('background-color', 'red');
		}
		function restoreBtn() {
			// console.log("== restoreBtn ==");
			$(this).css('background-color', btnColor);
		}

		var inputHtml = "<input type='text' id='newNationality' name='newNationality'>";
		var btnsHtml = "<div class='saveBtn'> save </div> <div class='cancelBtn'> cancel </div> ";
		var editHtml = inputHtml + btnsHtml;
		$('#newNationalityBtn').after(editHtml);
		$('.saveBtn, .cancelBtn').on('mouseover', hiliteBtn);
		$('.saveBtn, .cancelBtn').on('mouseout', restoreBtn);

		$('.saveBtn').click(function(e) {
			e.preventDefault();
			saveNewNationality();
			e.stopPropagation();
		});
		$('.cancelBtn').click(function(e, currentId) {
			e.preventDefault();
			cancelNewNationality();
			e.stopPropagation();
		});
	}

	function cancelNewNationality() {
		console.log("== cancelNewNationality ==");
		$('#newNationality, .saveBtn, .cancelBtn').remove();
	}

	function saveNewNationality() {
		console.log("== saveNewNationality ==");

		var url = "/new_nationality";
		var nationalityText = $('#newNationality').val();
		var jsonData = JSON.stringify({newNationality:nationalityText});

		$.ajax({
			url: url,
			data: jsonData,
			method: "POST",
			dataType: "json",
			contentType: "application/json; charset=utf-8"
		}).done(function(jsonData) {
			console.log("*** ajax success ***");
			console.dir(jsonData)
			updateNoticeMessage(jsonData);
		}).fail(function(unknown){
			console.log("*** ajax fail ***");
			console.log("unknown:", unknown);
		});
	}


	// ======= ======= ======= VIEW/SAVE ======= ======= =======
	// ======= ======= ======= VIEW/SAVE ======= ======= =======
	// ======= ======= ======= VIEW/SAVE ======= ======= =======

	// ======= displayRecipeTitles =======
	function displayRecipeTitles(jsonData) {
		console.log("== displayRecipeTitles ==");

		var nextId, nextTitle, recipeHtml, categoryStyle, nationalityStyle;
		var ratingText, categoryText, nationalityText;
		var recipeHtml = "";

		ratingObj = jsonData.ratingObj;
		categoryObj = jsonData.categoryObj;
		nationalityObj = jsonData.nationalityObj;

		// == object structure
		// ratingObj: 1=>{:id=>1, :rating=>[1, "favorite"], :color=>"#03045e"},
		// categoryObj: 2=>{:id=>2, :category=>"meat", :color=>"#54478cff"},
		// nationalityObj: 17=>{:id=>17, :nationality=>"Thai", :color=>"#54478c"},

		recipeHtml = recipeHtml + "<div>";
		recipeHtml = recipeHtml + "<div class='recipeHeader'>";
		recipeHtml = recipeHtml + "rating" + "</div>";
		recipeHtml = recipeHtml + "<div class='recipeHeader'>";
		recipeHtml = recipeHtml + "category" + "</div>";
		recipeHtml = recipeHtml + "<div class='recipeHeader'>";
		recipeHtml = recipeHtml + "nationality" + "</div>";
		recipeHtml = recipeHtml + "<div class='recipeHeader'>";
		recipeHtml = recipeHtml + "recipe" + "</div></div>";

		if (jsonData.recipeArray.length > 0) {
			for (var k = 0; k < jsonData.recipeArray.length; k++) {
				nextId = jsonData.recipeArray[k].id;
				nextRatingId = jsonData.recipeArray[k].rating_id;
				nextCategoryId = jsonData.recipeArray[k].category_id;
				nextNationalityId = jsonData.recipeArray[k].nationality_id;
				nextTitle = jsonData.recipeArray[k].title;

				if (nextRatingId) {
					ratingText = ratingObj[nextRatingId].rating[0] + ": " + ratingObj[nextRatingId].rating[1];
					ratingStyle = "color:" + ratingObj[nextRatingId].color;
				} else {
					selectedRating = "";
					ratingText = "";
					ratingStyle = "visibility:hidden";
				}
				if (nextCategoryId) {
					categoryText = categoryObj[nextCategoryId].category;
					categoryStyle = "color:" + categoryObj[nextCategoryId].color;
				} else {
					categoryText = "";
					categoryStyle = "visibility:hidden";
				}
				if (nextNationalityId) {
					nationalityText = nationalityObj[nextNationalityId].nationality;
					nationalityStyle = "color:" + nationalityObj[nextNationalityId].color;
				} else {
					nationalityText = "";
					nationalityStyle = "visibility:hidden";
				}

				recipeHtml = recipeHtml + "<div>";
				recipeHtml = recipeHtml + "<div class='ratingType' style='" + ratingStyle + ";'>";
				recipeHtml = recipeHtml + ratingText + "</div>";
				recipeHtml = recipeHtml + "<div class='recipeType' style='" + categoryStyle + ";'>";
				recipeHtml = recipeHtml + categoryText + "</div>";
				recipeHtml = recipeHtml + "<div class='recipeType' style='" + nationalityStyle + ";'>";
				recipeHtml = recipeHtml + nationalityText + "</div>";
				recipeHtml = recipeHtml + "<div class='recipeLink'>";
				recipeHtml = recipeHtml + "<a href='/show_recipe/" + nextId + "'>" + nextTitle;
				recipeHtml = recipeHtml + "</a></div></div>";
			}
		} else {
			recipeHtml = "<p class='info'> Sorry... no results were returned from the database.</p>";
		}
		$('#output').html(recipeHtml);
	}

	// ======= makeTitleText =======
	function makeTitleText(jsonData, type) {
		console.log("== makeTitleText ==");

		var titleText;

		if (jsonData != "") {
			if (jsonData.recipeArray.length > 0) {
				if (type == "title") {
					titleText = "Recipes with '" + jsonData.search + "' in title";
				} else if (type == "ingredient") {
					titleText = "Recipes with '" + jsonData.search + "' as an ingredient";
				} else if (type == "category") {
					titleText = "Recipes in the '" + jsonData.search + "' category";
				} else if (type == "nationality") {
					titleText = "Recipes classified as '" + jsonData.search + "'";
				} else if (type == "all") {
					titleText = "All Database Recipes";
				}
			} else {
				if (type == "title") {
					titleText = "No recipes found with '" + jsonData.search + "' in the title.";
				} else if (type == "ingredient") {
					titleText = "No recipes were found with '" + jsonData.search + "' as an ingredient.";
				} else if (type == "category") {
					titleText = "No recipes found in the '" + jsonData.search + "' category.";
				} else if (type == "nationality") {
					titleText = "No recipes classified as '" + jsonData.search + "' were found.";
				} else if (type == "all") {
					titleText = "All Database Recipes";
				}
			}
		} else {
			titleText = "Please enter a search value";
			$('#output').html("");
		}
		$('#outputTitle').text(titleText);
	}


	// ======= ======= ======= RECIPE FILES ======= ======= =======
	// ======= ======= ======= RECIPE FILES ======= ======= =======
	// ======= ======= ======= RECIPE FILES ======= ======= =======

	// ======= loadFileReader =======
    function loadFileReader() {
		console.log("== loadFileReader ==");
		document.getElementById('inputfile').addEventListener('change', function() {
			console.log("== change ==");

			// == create file reader object
			var fr = new FileReader();

			// ======= variables =======
			// ======= variables =======
			// ======= variables =======

			var nextLine, nextTitleLine;
			var numberIndex, nextChar;
			var numbersArray, fractionsArray;
			var quantityStart, quantityEnd, unitStart, unitEnd, ingredientStart;
			var titleString, quantityString, unitString, ingredientString, ingredient;
			var durationString, instruction;
			var ingredientObj, instructionObj;
			var durUnits, durRange;
			var unitCheck;

			var ingredientsFlag = false;
			var instructionsFlag = false;
			var durations = ["minutes", "minute", "seconds", "second"];

			var recipeObj = {recipe:titleString, ingredients:[], instructions:[]};
			var findTitleArray = [];
			var ingredientsArray = [];
			var instructionsArray = [];


			// ======= title =======
			// ======= title =======
			// ======= title =======

			// == backwards search findTitleArray for title line
			function getRecipeTitle(findTitleArray) {
				console.log("== getRecipeTitle ==");

				// == search backwards for non-blank/non-http/non-ingredients text (should be title)
				for (var j = findTitleArray.length - 1; j > -1; j--) {
					nextTitleLine = findTitleArray[j];

					if ((nextTitleLine.charCodeAt(0) == 10) || (nextTitleLine.charCodeAt(0) == 13) || (nextTitleLine == "")) {
						continue;
					} else if (nextTitleLine.includes("ingredients")) {
						continue;
					} else if (nextTitleLine.indexOf(".com") !== -1) {
						continue;
					} else {

						// == instructionsArray from previous recipe contains title for next recipe; remove it
						if (instructionsArray.length > 0) {
							instructionsArray.pop();
						}
						titleString = nextTitleLine;
						break;
					}
				}
				return titleString;
			}

			// == read text file; extract components
			function importRecipeData(fileText) {
				console.log("== importRecipeData ==");

				// == initialize duration flag (for instruction lines with timing data)
				var isDur = false;
				var lineCount = (fileText.split("\n")).length;


				// ======= ======= ======= MAIN LOOP ======= ======= =======
				// ======= ======= ======= MAIN LOOP ======= ======= =======
				// ======= ======= ======= MAIN LOOP ======= ======= =======


				// == line-by-line data extraction
				for (var i = 0; i < lineCount; i++) {
					nextLine = fileText.split('\n')[i].trim();

					// == store each line for backwards title search (via getRecipeTitle following "ingredients" line)
					findTitleArray.push(nextLine);


					// ======= ======= ======= line checks ======= ======= =======
					// ======= ======= ======= line checks ======= ======= =======
					// ======= ======= ======= line checks ======= ======= =======

					// == ignore page breaks
					if ((nextLine.charCodeAt(0) == 12) && ((i < (lineCount - 1)))) {
						continue;

					// == ignore blank lines
					} else if (((nextLine.charCodeAt(0) == 10) || (nextLine.charCodeAt(0) == 13) || (nextLine == "")) && ((i < (lineCount - 1)))) {
						continue;

					// == ignore web addresses
					} else if (nextLine.indexOf(".com") !== -1) {
						// console.log(" *** WEB");
						// console.log("nextLine: ", nextLine);
						continue;

					// == check for ingredients section; set ingredientsFlag
					} else if (((nextLine.match(/ingredients/g)) || (nextLine.match(/Ingredients/g)) || (nextLine.match(/ingredients:/g)) || (i == (lineCount - 1))) && (nextLine.length < 14)) {
						ingredientsFlag = true;

						// ======= ======= ======= collect recipe data (recipeObj) ======= ======= =======
						// ======= ======= ======= collect recipe data (recipeObj) ======= ======= =======
						// ======= ======= ======= collect recipe data (recipeObj) ======= ======= =======

						// == first recipe special case
						if (ingredientsArray.length == 0) {

							// == first element of instructionsArray is first recipe title; remove it
							instructionsArray.shift();

							// == backwards search findTitleArray for title line
							titleString = getRecipeTitle(findTitleArray);

							// == init recipeObj and findTitleArray for next recipe
							recipeObj = {recipe:titleString, ingredients:[], instructions:[]};
							findTitleArray = [];

						// == end of file special case: collect data
						} else if (i == (lineCount - 1)) {

							// == collect previous recipe
							recipeObj.ingredients = ingredientsArray;
							recipeObj.instructions = instructionsArray;

							//== build recipesArray
							recipesArray.push(recipeObj);

						// == "instructions" line indicates new recipe; collect previous recipe data
						} else {

							// == backwards search findTitleArray for title line
							titleString = getRecipeTitle(findTitleArray).trim();

							// == collect previous recipe
							recipeObj.ingredients = ingredientsArray;
							recipeObj.instructions = instructionsArray;

							//== build recipesArray
							recipesArray.push(recipeObj);

							// == init ingredientsArray and instructionsArray
							ingredientsArray = [];
							instructionsArray = [];

							// == init recipeObj and findTitleArray for next recipe
							recipeObj = {recipe:titleString, ingredients:[], instructions:[]};
							findTitleArray = [];
						}
						continue;

					// == check for instructions section; un-set ingredientsFlag
					} else if (nextLine.includes("instructions") || nextLine.includes("Instructions") || nextLine.includes("preparation") || nextLine.includes("method") || nextLine.includes("directions")) {
						ingredientsFlag = false;
						continue;
					}

					// == identify whole numbers and fractions (if any)
					numbersArray = nextLine.match(/\d+/g);
					hyphensArray = nextLine.match(/[1-9][0-9]*-[1-9][0-9]*/g)
					fractionsArray = nextLine.match(/[1-9][0-9]*\/[1-9][0-9]*/g)


					// ======= ======= ======= ingredients ======= ======= =======
					// ======= ======= ======= ingredients ======= ======= =======
					// ======= ======= ======= ingredients ======= ======= =======

					// == extract specific ingredients data elements
					if (ingredientsFlag) {
						// structure: quantity, units, ingredient

						// ======= quantities =======
						quantityString = "";

						// == ingredient starts with numeric quantity
						if (numbersArray) {
							if (fractionsArray) {

								// == quantity contains whole number and fraction
								if (numbersArray.length > 2) {
									numberIndex = nextLine.indexOf(numbersArray[0]);
									if (numbersArray[0].length == 1) {
										nextChar = nextLine.charAt(numberIndex + 1);
									} else if (numbersArray[0].length == 2) {
										nextChar = nextLine.charAt(numberIndex + 2);
									}

									// == determine if quantity is fraction only or whole plus fraction
									if (nextChar == " ") {
										quantityString = numbersArray[0] + " " + fractionsArray[0];
									} else if (nextChar == "/") {
										quantityString = fractionsArray[0];
									}

								// == quantity is a fraction only
								} else if (numbersArray.length == 2){
									quantityString = fractionsArray[0];
								}

							// == quantity is a number or hyphenated range
							} else {
								if (hyphensArray) {
									quantityString = numbersArray[0] + "-" + numbersArray[1];
								} else {
									quantityString = numbersArray[0];
								}
							}

							// ======= units =======

							// == determine where quantity characters end (for start of units word)
							unitString = "";
							quantityStart = nextLine.indexOf(quantityString);
							quantityEnd = quantityStart + quantityString.length;
							unitStart = quantityEnd + 1;

							// == scan line characters for word following quantity (word ends with space character)
							for (var k = unitStart; k < nextLine.length; k++) {
								if (nextLine[k] != " ") {
									unitString = unitString + nextLine[k];
								} else if (nextLine[k] == " ") {
									break;
								}
							}

							var standardString = standardUnits(unitString);
							if (standardString == "ITEM") {
								standardString = unitString;
							}

							// ======= ingredient =======
							ingredientString = ""
							ingredientStart = unitStart + unitString.length + 1;
							ingredientString = nextLine.substring(ingredientStart);
							ingredientObj = {quantity:quantityString, units:standardString, ingredient:ingredientString};
							ingredientsArray.push(ingredientObj);

						// == ingredient starts with text
						} else {
							ingredientString = nextLine.substring(0);

							// == eliminate notes and subheading lines
							if (ingredientString[ingredientString.length - 2] == ":") {
								continue;
							} else {
								ingredientObj = {quantity:null, units:null, ingredient:ingredientString};

								// == build ingredientsArray
								ingredientsArray.push(ingredientObj);
							}
						}


					// ======= ======= ======= instructions ======= ======= =======
					// ======= ======= ======= instructions ======= ======= =======
					// ======= ======= ======= instructions ======= ======= =======

					// == extract specific duration data elements
					} else {

						// == line has numbers; scan for duration units
						if (numbersArray) {

							// == check line for duration units (e.g. minutes); ignore tempeerature values in any
							for (var a = 0; a < durations.length; a++) {
								if (nextLine.indexOf(durations[a]) !== -1) {
									isDur = true;
									durUnits = durations[a];
									break;
							    }
							}

							// == duration units found in line
							if (isDur) {

								// == look for hyphen character (indicates range of values in line)
								durRange = nextLine.match(/\d+(?=-)/g);

								// == check for single value or range of values
								if (numbersArray.length > 1) {
									if (durRange) {
										durationString = numbersArray[0] + "-" + numbersArray[1];
									}
								} else if (numbersArray.length == 1) {
									durationString = numbersArray[0];
								}
								instructionObj = {instruction:nextLine, duration:durationString, durUnits:durUnits};
								isDur = false;
							} else {
								instructionObj = {instruction:nextLine, duration:null, durUnits:null};
							}
						} else {

							// == ignore "notes" lines
							if (nextLine[nextLine.length - 2] == ":") {
								continue;
							} else {
								instructionObj = {instruction:nextLine, duration:null, durUnits:null};
							}
						}

						// == build instructionsArray
						instructionsArray.push(instructionObj);
					}
				}
				return recipesArray;
			}

			// == load data file
			fr.onload = function() {
				var fileText = fr.result;
				var recipeData = importRecipeData(fileText);
				displayRecipeData(recipeData);
				updateMenuLinks(recipeData);
			}
			fr.readAsText(this.files[0]);
		})
	}

	// ======= displayRecipeData =======
    function displayRecipeData(recipeData) {
        console.log("== displayRecipeData ==");

		var nextRecipe, nextTitle, nextIngredients, nextInstructions;
		var nextQuantity, nextUnits, nextIngredient, nextText, nextHtml;
		var nextInstruction, nextDuration, nextDurUnits;
		var recipeHtml = "";

		for (var i = 0; i < recipeData.length; i++) {
			nextRecipe = recipeData[i];
			nextTitle = recipeData[i].recipe;
			nextIngredients = recipeData[i].ingredients;
			nextInstructions = recipeData[i].instructions;

			// == recipe title
			recipeHtml = recipeHtml + "<p class='recipeTitle'>" + nextTitle + "</p>";

			// == ingredients label
			recipeHtml = recipeHtml + "<p class='recipeLabel'>ingredients</p>";

			// == ingredients lines: ingredientObj = {quantity:___, units:___, ingredient:___};
			for (var j = 0; j < nextIngredients.length; j++) {
				nextQuantity = nextIngredients[j].quantity;
				nextUnits = nextIngredients[j].units;
				nextIngredient = nextIngredients[j].ingredient;

				// == eliminate ingredients without quantities/units
				if (nextQuantity == null) {
					nextQuantity = "";
				}
				if (nextUnits == null) {
					nextUnits = "";
				}

				nextText = (nextQuantity + " " + nextUnits + " " + nextIngredient).trim()
				nextHtml = "<p class='ingredient'>" + nextText + "</p>";
				recipeHtml = recipeHtml + nextHtml;
			}

			recipeHtml = recipeHtml + "<p class='recipeLabel'>instructions</p>";

			// instructionObj = {instruction:___, duration:___, durUnits:___};
			for (var k = 0; k < nextInstructions.length; k++) {
				nextInstruction = nextInstructions[k].instruction;
				nextDuration = nextInstructions[k].duration;
				nextDurUnits = nextInstructions[k].durUnits;
				nextHtml = "<p class='instruction'>" + nextInstruction + "</p>";
				recipeHtml = recipeHtml + nextHtml;
			}
		}
		$('#output').html(recipeHtml);
		$('#inputfile').remove();
		updateTitleText("Imported Recipes");
	}

	// ======= saveRecipeData =======
	function saveRecipeData(recipeData, importEdit) {
		console.log("== saveRecipeData ==");

		if (importEdit == "import") {
			var url = "/save_recipe_file";
		} else {
			var url = "/save_recipe_edits";
		}

		var jsonData = JSON.stringify(recipeData);

		$.ajax({
		    url: url,
			data: jsonData,
		    method: "POST",
			dataType: "json",
			contentType: "application/json; charset=utf-8"
		}).done(function(jsonData) {
		    console.log("*** ajax success ***");
		    console.dir(jsonData)
			if (importEdit == "import") {
				updateImportLink("import recipes");
			}
			updateNoticeMessage(jsonData);
		}).fail(function(unknown){
		    console.log("*** ajax fail ***");
			console.log("unknown:", unknown);
		});
	}


	// ======= ======= ======= UTILITIES ======= ======= =======
	// ======= ======= ======= UTILITIES ======= ======= =======
	// ======= ======= ======= UTILITIES ======= ======= =======

	function toggleEditButtons(showOrHide) {
		console.log("== toggleEditButtons ==");

		if (showOrHide == "hide") {
			$('#rating_edit_select').hide();
			$('#category_edit_select').hide();
			$('#nationality_edit_select').hide();
			$('#cancelRecipeEdits').hide();
			$('#saveRecipeEdits').hide();
			$('#deleteRecipe').hide();
		} else {
			$('#rating_edit_select').show();
			$('#category_edit_select').show();
			$('#nationality_edit_select').show();
			$('#cancelRecipeEdits').show();
			$('#saveRecipeEdits').show();
			$('#deleteRecipe').show();
		}
	}

	// ======= updateTitleText =======
	function updateTitleText(titleText) {
		console.log("== updateTitleText ==");
		$('#outputTitle').text(titleText);
	}

	// ======= updateNoticeMessage =======
	function updateNoticeMessage(jsonData) {
		console.log("== updateNoticeMessage ==");
		var htmlString = jsonData.message;
		$('#notice').html(htmlString);
	}

	// ======= updateMenuLinks =======
    function updateMenuLinks(recipeData) {
        console.log("== updateMenuLinks ==");

		// == change import b=link to save link
		updateImportLink("save recipes")
		$('#import').click(function(e) {
			e.preventDefault();
			saveRecipeData(recipeData, "import");
			e.stopPropagation();
	    });
	}

	// ======= updateImportLink =======
	function updateImportLink(linkText) {
		console.log("== updateImportLink ==");
		$('#import').text(linkText);
	}

	// ======= standardUnits =======
    function standardUnits(unitString) {
		// console.log("== standardUnits ==");

		// == distinguish "t" and "T" as "tsp" and "Tbsp"
		if (unitString == "t") {
			unitString = "TSP";
		}
		if (unitString == "T") {
			unitString = "TBSP";
		}

		// == eliminate case sensitivity (convert all to upper)
		unitString = unitString.toUpperCase();

		switch(unitString) {
			case "CAN":
			unitString = "can";
			break;
			case "CANS":
			unitString = "can";
			break;
			case "TEASPOON":
			unitString = "tsp";
			break;
			case "TEASPOONS":
			unitString = "tsp";
			break;
			case "TSP.":
			unitString = "tsp";
			break;
			case "TSP":
			unitString = "tsp";
			break;
			case "TABLESPOON":
			unitString = "Tbsp";
			break;
			case "TABLESPOONS":
			unitString = "Tbsp";
			break;
			case "TBSP":
			unitString = "Tbsp";
			break;
			case "TBSP.":
			unitString = "Tbsp";
			break;
			case "CUP":
			unitString = "cup";
			break;
			case "CUPS":
			unitString = "cup";
			break;
			case "C":
			unitString = "cup";
			break;
			case "LB":
			unitString = "lb";
			break;
			case "POUND":
			unitString = "lb";
			break;
			case "POUNDS":
			unitString = "lb";
			break;
			case "OZ":
			unitString = "oz";
			break;
			case "OUNCE":
			unitString = "oz";
			break;
			case "OUNCES":
			unitString = "oz";
			break;
			default:
			unitString = "ITEM";
		}
		return unitString;
	}
});
