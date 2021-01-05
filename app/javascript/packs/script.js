$(document).on('turbolinks:load', function() {
    console.log("== turbolinks:load ==");

	// ======= displayPopup =======
	function displayPopup(type, data) {
		console.log("== displayPopup ==");

		var popupHtml = "";

		if (type == "search") {
			popupHtml = popupHtml + "<p>Please enter a search value.</p>";
		} else if (type == "edit") {
			popupHtml = popupHtml + "<p>You haven't saved your edits yet.</p>";
			popupHtml = popupHtml + "<p>Click <span>Save</span> or <span>Cancel</span> before choosing another function.</p>";
		} else if (type == "newLine") {
			popupHtml = popupHtml + "<p>Your new " + data + " is at the bottom of the list.</p>";
			popupHtml = popupHtml + "<p>Drag it to its proper place in the sequence,</p>";
			popupHtml = popupHtml + "<p>then click <span>Save</span> or <span>Cancel</span>.</p>";
		}

		$('#popup-message').html(popupHtml);
		$(".popup-overlay, .popup-content").addClass("active");
	}

	$(".close, .popup").off("click");
	$(".close, .popup").on("click", function(){
		console.log("== popup: close ==");
		$('#popup-message').html("");
		$(".popup-overlay, .popup-content").removeClass("active");
	});


    // ======= check pathname =======
    var pathname = window.location.pathname;
	var pathParts = pathname.split("/");
    var pathPartsCount = (pathname.split("/").length - 1);
	console.log("pathParts: ", pathParts);


	// ======= import recipes =======
    if (pathname == "/import_recipes") {
		loadFileReader();


	// ======= show recipe =======
	} else {
		if (pathParts[1] == "show_recipe") {

			// == add local placeholder for new or delete designation
			var ingredientsData = $('#ingredientsData').data().ingredients;
			for (var i = 0; i < ingredientsData.length; i++) {
				ingredientsData[i].new_delete = null;
			}
			var instructionsData = $('#instructionsData').data().instructions;
			for (var i = 0; i < instructionsData.length; i++) {
				instructionsData[i].new_delete = null;
			}

			// == add local placeholder for previous value (for undo/cancel options)
			$('#titleData').data().prev_title = $('#titleData').data().title;
			$('#ratingData').data().prev_ratingid = $('#ratingData').data().ratingid;
			$('#categoryData').data().prev_categoryid = $('#categoryData').data().categoryid;
			$('#nationalityData').data().prev_nationalityid = $('#nationalityData').data().nationalityid;

			// ======= ======= ======= enable drag-n-drop ======= ======= =======
			// ======= ======= ======= enable drag-n-drop ======= ======= =======
			// ======= ======= ======= enable drag-n-drop ======= ======= =======

			// ======= ingredients =======
			$('#ingredients').sortable({
				start: function (event, ui) {
					console.log("== start ==");
					var elementId = $(ui.item).attr('id');
					var itemId = elementId.split("_")[1];
					$(ui.item).data('startindex', ui.item.index());
					$(ui.item).data('elementId', elementId);
					$(ui.item).data('itemId', itemId);
				},
				stop: function (event, ui) {
					console.log("== stop ==");
					activateSaveCancel();						// ingredient moved: enable cancel button
					self.updateItemPositions(ui.item);
					self.updateItemSequences("ingr");
				}
			}).disableSelection();

			// ======= instructions =======
			$('#instructions').sortable({
				start: function (event, ui) {
					console.log("== start ==");
					var elementId = $(ui.item).attr('id');
					var itemId = elementId.split("_")[1];
					$(ui.item).data('startindex', ui.item.index());
					$(ui.item).data('elementId', elementId);
					$(ui.item).data('itemId', itemId);
				},
				stop: function (event, ui) {
					console.log("== stop ==");
					activateSaveCancel();						// instruction moved: enable cancel button
					updateItemPositions(ui.item);
					updateItemSequences("inst");
				}
			}).disableSelection();

			// ======= init unedited sort order =======
			var ingredientsInOrder = $("#ingredients").sortable("toArray");		// ingredient element ids
			var instructionsInOrder = $("#instructions").sortable("toArray");	// instruction element ids

			// ======= update sort order =======
			updateItemPositions = function($item) {
				console.log("== updateItemPositions ==");

				editFlag = true;
			    var startIndex = $item.data("startindex") + 1;
			    var newIndex = $item.index() + 1;

			    if (newIndex != startIndex) {
					var itemIndexData = { id: $item.attr("id"), oldPosition: startIndex, newPosition: newIndex };
					ingredientsInOrder = $("#ingredients").sortable("toArray");
					instructionsInOrder = $("#instructions").sortable("toArray");
			    }
			}

			// ======= update sort order =======
			updateItemSequences = function(ingrOrInst) {
				console.log("== updateItemSequences ==");
				console.log("ingrOrInst: ", ingrOrInst);

				var nextIngredientId, nextIngredientEl, nextInstructionId, nextInstructionEl;

				// == update ingredient sequence display for new order
				if (ingrOrInst == "ingr") {
					var sortedListItems = ingredientsInOrder;
					var localDataItems = $('#ingredientsData').data().ingredients;
				} else {
					var sortedListItems = instructionsInOrder;
					var localDataItems = $('#instructionsData').data().instructions;
				}
				console.log("sortedListItems: ", sortedListItems);
				console.log("localDataItems: ", localDataItems);

				// == cycle through item list and renumber sequences
				for (var i = 0; i < sortedListItems.length; i++) {
					nextItemId = sortedListItems[i];
					nextItemNum = nextItemId.split("_")[1];
					nextItemName = nextItemId.split("_")[0];
					nextItemEl = $('#' + nextItemId)[0];
					nextItemSeq = $(nextItemEl).children()[0];
					nextItemSeq.innerHTML = (i + 1).toString();

					// == cycle through local database data to update sequence numbers
					for (var j = 0; j < localDataItems.length; j++) {
						checkItemId = localDataItems[j].id;

						// == existing item (id is an integer)
						if (!isNaN(checkItemId)) {
							if (checkItemId == nextItemNum) {
								localDataItems[j].sequence = i + 1;
							}

						// == new item (id format: NEW_XX)
						} else {
							checkItemNum = checkItemId.split("_")[1];
							if (checkItemNum == nextItemNum) {
								localDataItems[j].sequence = i + 1;
							}
						}
					}
				}
			}

			// ======= enable ingredients/instructions editing =======
			activateEditLinks();

		} else if (pathParts[1] == "nationalities") {
			activateNationalities();
		}
	}
	activateMainMenu();


	// ======= initialize variables =======
	var recipesArray = [];		// will contain any imported recipe file data
	var editFlag = false;		// stays false until recipe data is changed


	// ======= ======= ======= MAIN MENU: SEARCH ======= ======= =======
	// ======= ======= ======= MAIN MENU: SEARCH ======= ======= =======
	// ======= ======= ======= MAIN MENU: SEARCH ======= ======= =======

	// ======= activateMainMenu =======
    function activateMainMenu() {
		console.log("== activateMainMenu ==");

		// == detect Enter key for search text (in ingredients or title)
		$('body').keyup(function(e) {
			console.log("== keyup ==");
	        if (e.keyCode === 13) {
				var searchValue = $('#search').val();
				if (searchValue != "") {
					var searchString = $('#search_select option:selected').val();
					if (editFlag == false) {
						toggleEditButtons("hide");
						searchRecipes(searchString, "text");
					} else {
						displayPopup("edit", "");
					}
					e.stopPropagation();
				} else {
					displayPopup("search", "");
				}
	        }
	    });

		// == show all recipes
		$('#getAllRecipes').click(function(e) {
			console.log("== click: getAllRecipes ==");
			e.preventDefault();
			if (editFlag == false) {
				toggleEditButtons("hide");
				searchRecipes("", "all");
			} else {
				displayPopup("edit", "");
			}
			e.stopPropagation();
		});

		// == button for search text (alternative to Enter key)
		$('#searchText').click(function(e) {
			console.log("== click: searchText ==");
			e.preventDefault();
			var searchValue = $('#search').val();
			if (searchValue != "") {
				var searchString = $('#search_select option:selected').val();
				if (editFlag == false) {
					toggleEditButtons("hide");
					searchRecipes(searchString, "text");
				} else {
					displayPopup("edit", "");
				}
			}
			e.stopPropagation();
		});

		// == search by rating
		$('#rating_select').change(function(e) {
			console.log("== change: rating_select ==");
			e.preventDefault();
			if (editFlag == false) {
				$('#rating_select').removeClass('neutral');		// set to *active* color
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
				displayPopup("edit", "");
			}
	    });

		// == search by category
		$('#category_select').change(function(e) {
			console.log("== change: category_select ==");
			e.preventDefault();
			if (editFlag == false) {
				$('#rating_select').val(null);					// set to no selection
				$('#category_select').removeClass('neutral');	// set to *active* color
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
				displayPopup("edit", "");
			}
	    });

		// == search by nationality
		$('#nationality_select').change(function(e) {
			console.log("== change: nationality_select ==");
			e.preventDefault();
			if (editFlag == false) {
				$('#rating_select').val(null);						// set to no selection
				$('#category_select').val(null);					// set to no selection
				$('#nationality_select').removeClass('neutral');	// set to *active* color
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
				displayPopup("edit", "");
			}
	    });
	}


	// ======= ======= ======= set SEARCH type ======= ======= =======
	// ======= ======= ======= set SEARCH type ======= ======= =======
	// ======= ======= ======= set SEARCH type ======= ======= =======

	function searchRecipes(searchString, searchType) {
		console.log("== searchRecipes ==");
		console.log("searchString: ", searchString);
		console.log("searchType: ", searchType);

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
			case "text":
			var searchText = $('#search').val();
			searchString = [searchString, searchText];
			var url = "/search_text";
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
			console.dir(jsonData);
			displayRecipeTitles(jsonData);
			makeTitleText(jsonData, searchType);
			updateNoticeMessage(jsonData);
			deactivateTitleEdit();
		}).fail(function(unknown){
			console.log("*** ajax fail ***");
			console.log("unknown:", unknown);
		});
	}


	// ======= ======= ======= RECIPE EDIT MENU ======= ======= =======
	// ======= ======= ======= RECIPE EDIT MENU ======= ======= =======
	// ======= ======= ======= RECIPE EDIT MENU ======= ======= =======

	// ======= activateSaveCancel =======
	function activateSaveCancel() {
		console.log("== activateSaveCancel ==");

		$('#recipeBox2').css('display', 'block');
		var saveState = $('#saveRecipeEdits').hasClass("active");
		var cancelState = $('#cancelRecipeEdits').hasClass("active");
		console.log("saveState: ", saveState);
		console.log("cancelState: ", cancelState);

		// == select to send changes to database
		if (!saveState) {
			$('#saveRecipeEdits').addClass('active');
			$('#saveRecipeEdits').click(function(e) {
				console.log("== click: saveRecipeEdits ==");
				e.preventDefault();
				editFlag = false;
				saveRecipeEdits();
				e.stopPropagation();
			});
		}

		// == select to cancel changes
		if (!cancelState) {
			$('#cancelRecipeEdits').addClass('active');
			$('#cancelRecipeEdits').click(function(e) {
				console.log("== click: cancelRecipeEdits ==");
				e.preventDefault();
				editFlag = false;
				cancelRecipeEdits();
				e.stopPropagation();
			});
		}
	}

	// ======= updateLocalIngrinst =======
	function updateLocalIngrinst(jsonData) {
		console.log("== updateLocalIngrinst ==");

		// == store updated data from database in local data elements
		var updatedIngredients = JSON.parse(jsonData.updated_ingredients);
		var updatedInstructions = JSON.parse(jsonData.updated_instructions);
		$('#ingredientsData').data('ingredients', updatedIngredients);
		$('#instructionsData').data('instructions', updatedInstructions);
		console.log("$('#ingredientsData').data(): ", $('#ingredientsData').data());
		console.log("$('#instructionsData').data(): ", $('#instructionsData').data());

	}

	// ======= saveRecipeEdits =======
	function saveRecipeEdits() {
		console.log("== saveRecipeEdits ==");

		var nextItem, nextItemId, nextIngredientId, nextInstructionId;

		// == deactivate save and cancel buttons
		$('#saveRecipeEdits').removeClass('active');
		$('#cancelRecipeEdits').removeClass('active');
		editFlag = false;

		// == get local data for Ajax send
		var currentId = $('#recipeId').data().recipeid;
		var titleData = $('#titleData').data().title;
		var ratingData = $('#ratingData').data().ratingid;
		var categoryData = $('#categoryData').data().categoryid;
		var nationalityData = $('#nationalityData').data().nationalityid;
		var ingredientsData = $('#ingredientsData').data().ingredients;		// with NEW or DELETE flag (if any) and revised text
		var instructionsData = $('#instructionsData').data().instructions;	// with NEW or DELETE flag (if any) and revised text

		// == update ingredient/instruction sequence values to capture sort changes
		for (var i = 0; i < ingredientsInOrder.length; i++) {
			nextItem = ingredientsInOrder[i];
			nextItemId = nextItem.split("_")[1];			// id format: "ingrLine_XXXX" (XXXX = database id or sequence number)
			for (var j = 0; j < ingredientsData.length; j++) {
				nextIngredientId = ingredientsData[j].id;
				if (nextItemId == nextIngredientId) {
					ingredientsData[j].sequence = i + 1;
				}
			}
		}
		for (var a = 0; a < instructionsInOrder.length; a++) {
			nextItem = instructionsInOrder[a];
			nextItemId = nextItem.split("_")[1];			// id format: "ingrLine_XXXX" (XXXX = database id or sequence number)
			for (var b = 0; b < instructionsData.length; b++) {
				nextInstructionId = instructionsData[b].id;
				if (nextItemId == nextInstructionId) {
					instructionsData[b].sequence = a + 1;
				}
			}
		}

		// == avoid null values (when classification items not set by user)
		if (!ratingData.ratingid) {
			ratingData.ratingid = 0;
		}
		if (!categoryData.categoryid) {
			categoryData.categoryid = 0;
		}
		if (!nationalityData.nationalityid) {
			nationalityData.nationalityid = 0;
		}

		// == package data for send
		var recipeData = {
			recipe_id:currentId,
			title:titleData,
			rating_id:ratingData,
			category_id:categoryData,
			nationality_id:nationalityData,
			ingredients:ingredientsData,
			instructions:instructionsData
		};

		//== return saved data to database
		saveRecipeData(recipeData, "edit");
	}

	// ======= cancelRecipeEdits =======
	function cancelRecipeEdits() {
		console.log("== cancelRecipeEdits ==");
		location.reload();
	}

	// ======= deactivateTitleEdit =======
    function deactivateTitleEdit() {
		console.log("== deactivateTitleEdit ==");
		$('#outputTitle').off('mouseover');
		$('#outputTitle').off('mouseout');
		$('#outputTitle').off('click');
	}

	// ======= activateEditLinks =======
    function activateEditLinks() {
		console.log("== activateEditLinks ==");

		var btnColor;
		var textColor;
		var currentText, currentId;


		// ======= ======= ======= classification ======= ======= =======
		// ======= ======= ======= classification ======= ======= =======
		// ======= ======= ======= classification ======= ======= =======

		// == set recipe rating
		$('#rating_edit_select').change(function(e) {
			console.log("== change: rating_edit_select ==");
			e.preventDefault();

			// == temporarily store previous value for this item (rating)
			editFlag = true;

			var rating = $('#rating_edit_select option:selected').text();
			var ratingId = $('#rating_edit_select option:selected').val();
			$('#ratingData').data().prev_ratingid = $('#ratingData').data().ratingid;
			$('#ratingData').data().ratingid = ratingId;

			// == activate save and cancel buttons
			activateSaveCancel();
	    });

		// == set recipe category
		$('#category_edit_select').change(function(e) {
			console.log("== change: category_edit_select ==");
			e.preventDefault();

			// == temporarily store previous value for this item (category)
			editFlag = true;

			var category = $('#category_edit_select option:selected').text();
			var categoryId = $('#category_edit_select option:selected').val();
			$('#categoryData').data().prev_categoryid = $('#categoryData').data().categoryid;
			$('#categoryData').data().categoryid = categoryId;

			// == activate save and cancel buttons
			activateSaveCancel();
	    });

		// == set recipe nationality
		$('#nationality_edit_select').change(function(e) {
			console.log("== change: nationality_edit_select ==");
			e.preventDefault();

			// == temporarily store previous value for this item (nationality)
			editFlag = true;

			var nationality = $('#nationality_edit_select option:selected').text();
			var nationalityId = $('#nationality_edit_select option:selected').val();
			$('#nationalityData').data().prev_nationalityid = $('#nationalityData').data().nationalityid;
			$('#nationalityData').data().nationalityid = nationalityId;

			// == activate save and cancel buttons
			activateSaveCancel();
	    });


		// ======= ======= ======= save/cancel/delete ======= ======= =======
		// ======= ======= ======= save/cancel/delete ======= ======= =======
		// ======= ======= ======= save/cancel/delete ======= ======= =======

		// == select to delete recipe entirely from database
		$('#deleteRecipe').click(function(e) {
			console.log("== click: deleteRecipe ==");
			e.preventDefault();
			editFlag = false;
			deleteRecipe($('#recipeId').data().recipeid);
			e.stopPropagation();
		});


		// ======= ======= ======= line behaviors ======= ======= =======
		// ======= ======= ======= line behaviors ======= ======= =======
		// ======= ======= ======= line behaviors ======= ======= =======

		$('#outputTitle').on('mouseover', hiliteLink);
		$('#outputTitle').on('mouseout', restoreLink);
		$('#outputTitle').on('click', editRecipeTitle);
		$('.ingredient, .instruction').on('mouseover', hiliteLink);
		$('.ingredient, .instruction').on('mouseout', restoreLink);
		$('.ingredient, .instruction').on('click', editRecipeLine);
		$('.addBtn').on('mouseover', hiliteBtn);
		$('.addBtn').on('mouseout', restoreBtn);
		$('.addBtn').on('click', inputNewLine);

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


		// ======= ======= ======= title edit/update/cancel ======= ======= =======
		// ======= ======= ======= title edit/update/cancel ======= ======= =======
		// ======= ======= ======= title edit/update/cancel ======= ======= =======

		// ======= editRecipeTitle =======
		function editRecipeTitle() {
			console.log("== editRecipeTitle ==");

			// == store existing title text (for restore if edits cancelled)
			currentText = $(this).text();

			// == create textbox and button controls for revised title
			var inputHtml = "<input type='text' id='editTitleText' name='editTitleText' value='" + currentText + "'>";
			var btnsHtml = "<div id='titleSaveBtn' class='saveBtn'> save </div> <div id='titleCancelBtn' class='cancelBtn'> cancel </div> ";
			var editHtml = inputHtml + btnsHtml;
			$(this).replaceWith(editHtml);
			$('.saveBtn, .cancelBtn').on('mouseover', hiliteBtn);
			$('.saveBtn, .cancelBtn').on('mouseout', restoreBtn);

			$('.saveBtn').click(function(e) {
				e.preventDefault();
				editFlag = true;
				updateRecipeTitle();
				activateSaveCancel();
				e.stopPropagation();
		    });
			$('.cancelBtn').click(function(e) {
				e.preventDefault();
				cancelTitleEdits(currentText);
				e.stopPropagation();
		    });
		}

		// ======= updateRecipeTitle =======
		function updateRecipeTitle() {
			console.log("== updateRecipeTitle ==");

			var newText = $('#editTitleText').val();

			// == save previous title; save new value for ajax submit
			$('#titleData').data().prev_title = $('#titleData').data().title;
			$('#titleData').data().title = newText;

			// == update html string with changes
			var saveHtml = "<h2 id='outputTitle'>" + newText + "</h2>";
			$('#editTitleText').replaceWith(saveHtml);
			$('.saveBtn, .cancelBtn').remove();

			// == restore line hilites and click behavior
			$('#' + currentId).on('mouseover', hiliteLink);
			$('#' + currentId).on('mouseout', restoreLink);
			$('#' + currentId).on('click', editRecipeTitle);
		}

		// ======= cancelTitleEdits =======
		function cancelTitleEdits(currentText) {
			console.log("== cancelTitleEdits ==");

			// == restore html string
			var saveHtml = "<h2 id='outputTitle'>" + currentText + "</h2>";
			$('#editTitleText').replaceWith(saveHtml);
			$('.saveBtn, .cancelBtn').remove();

			// == restore line hilites and click behavior
			$('#outputTitle').on('mouseover', hiliteLink);
			$('#outputTitle').on('mouseout', restoreLink);
			$('#outputTitle').on('click', editRecipeTitle);
		}


		// ======= ======= ======= line edit/update/cancel ======= ======= =======
		// ======= ======= ======= line edit/update/cancel ======= ======= =======
		// ======= ======= ======= line edit/update/cancel ======= ======= =======

		// ======= editRecipeLine =======
		function editRecipeLine() {
			console.log("== editRecipeLine ==");

			editFlag = true;

			// == remove/restore existing edit mode elements if any
			if ($('.saveBtn').length > 0) {
				$('.saveBtn, .cancelBtn, .deleteBtn').remove();
				var saveHtml = "<p class='ingredient' id='" + currentId + "'>" + currentText + "</p>";
				$('#' + currentId).replaceWith(saveHtml);
				$('#' + currentId).on('mouseover', hiliteLink);
				$('#' + currentId).on('mouseout', restoreLink);
				$('#' + currentId).on('click', editRecipeLine);
			}

			// == set edit mode parameters for currently selected element
			var inputHtml = "";
			currentText = $(this).text();
			currentId = $(this).attr('id');
			inputHtml = inputHtml + "<textarea class='editItem' id='" + currentId + "' name='" + currentId + "'";
			inputHtml = inputHtml + " cols='40' rows='5'>" + currentText + "</textarea>";
			var btnsHtml = "<div class='saveBtn'> save </div> <div class='cancelBtn'> cancel </div> <div class='deleteBtn'> delete </div> ";
			var editHtml = inputHtml + btnsHtml;
			$(this).replaceWith(editHtml);

			// == activate save/cancel/delete buttons
			$('.saveBtn, .cancelBtn, .deleteBtn').on('mouseover', hiliteBtn);
			$('.saveBtn, .cancelBtn, .deleteBtn').on('mouseout', restoreBtn);
			$('.saveBtn').on('click', updateRecipeLine);
			$('.cancelBtn').on('click', cancelLineEdits);
			$('.deleteBtn').on('click', deleteRecipeLine);
		}

		// ======= updateRecipeLine =======
		function updateRecipeLine() {
			console.log("== updateRecipeLine ==");

			var nextId, nextSequence;

			// == currentId format: ingredient_XXXX or instruction_XXXX (XXXX = database id)
			var itemId = currentId.split("_")[1];
			var ingrOrInst = currentId.split("_")[0];	// determine if line is ingredient or instruction

			// == get database record stored in local div (data value)
			var ingredientsData = $('#ingredientsData').data();
			var instructionsData = $('#instructionsData').data();
			var newText = $('#' + currentId).val();

			// == save ingredient changes to local data
			for (var i = 0; i < ingredientsData.ingredients.length; i++) {
				nextId = ingredientsData.ingredients[i].id;
				nextSequence = parseInt($('#ingrSeq_' + nextId).val());
				ingredientsData.ingredients[i].sequence = nextSequence;
				if (nextId == itemId) {
					ingredientsData.ingredients[i].ingredient = newText;
					break;
				}
			}

			// == save instruction changes to local data
			for (var i = 0; i < instructionsData.instructions.length; i++) {
				nextId = instructionsData.instructions[i].id;
				nextSequence = parseInt($('#instSeq_' + nextId).val());
				instructionsData.instructions[i].sequence = nextSequence;
				if (nextId == itemId) {
					instructionsData.instructions[i].instruction = newText;
					break;
				}
			}

			// == update html string with changes
			var saveHtml = "<p class='ingredient' id='" + currentId + "'>" + newText + "</p>";
			$('#' + currentId).replaceWith(saveHtml);
			$('.saveBtn, .cancelBtn, .deleteBtn').remove();

			// == restore line hilites and click behavior
			$('#' + currentId).on('mouseover', hiliteLink);
			$('#' + currentId).on('mouseout', restoreLink);
			$('#' + currentId).on('click', editRecipeLine);

			// == activate save and cancel buttons
			activateSaveCancel();
		}

		// ======= cancelLineEdits =======
		function cancelLineEdits() {
			console.log("== cancelLineEdits ==");
			editFlag = false;
			var saveHtml = "<p class='ingredient' id='" + currentId + "'>" + currentText + "</p>";
			$('#' + currentId).replaceWith(saveHtml);
			$('.saveBtn, .cancelBtn, .deleteBtn').remove();
			$('#' + currentId).on('mouseover', hiliteLink);
			$('#' + currentId).on('mouseout', restoreLink);
			$('#' + currentId).on('click', editRecipeLine);
		}


		// ======= ======= ======= line add/save/delete ======= ======= =======
		// ======= ======= ======= line add/save/delete ======= ======= =======
		// ======= ======= ======= line add/save/delete ======= ======= =======

		// ======= inputNewLine =======
		function inputNewLine() {
			console.log("== inputNewLine ==");

			var editHtml = "";

			// == determine if ingredient or instruction add button was clicked
			var ingrOrInst = $(this).attr('id');

			if (ingrOrInst == "ingrAdd") {
				var ingrCount = $('#ingredients').children().length + 1;
				editHtml = editHtml + "<div id='ingrLine_" + ingrCount + "' class='recipeLine newRecipeLine iu-sortable-handle'>";
				editHtml = editHtml + "<input type='text' class='newItem' id='newIngr' name='newIngr'>";
				editHtml = editHtml + "<div class='saveBtn' id='ingrSave'> save </div> <div class='cancelBtn' id='ingrCancel'> cancel </div>";
				editHtml = editHtml + "</div>";
				$('#ingredients').prepend(editHtml);
			} else if (ingrOrInst == "instAdd") {
				var instCount = $('#instructions').children().length + 1;
				editHtml = editHtml + "<div id='instLine_" + instCount + "' class='recipeLine newRecipeLine iu-sortable-handle'>";
				editHtml = editHtml + "<input type='text' class='newItem' id='newInst' name='newInst'>";
				editHtml = editHtml + "<div class='saveBtn' id='instSave'> save </div> <div class='cancelBtn' id='instCancel'> cancel </div>";
				editHtml = editHtml + "</div>";
				$('#instructions').prepend(editHtml);
			}

			$('.saveBtn, .cancelBtn').on('mouseover', hiliteBtn);
			$('.saveBtn, .cancelBtn').on('mouseout', restoreBtn);
			$('.saveBtn').on('click', saveNewLine);
			$('.cancelBtn').on('click', cancelNewLine);
		}

		// ======= saveNewLine =======
		function saveNewLine() {
			console.log("== saveNewLine ==");

			// == determine if ingredient or instruction add button was clicked
			var ingrOrInst = $(this).attr('id');

			// == identify recipe being edited
			var recipeId = $('#recipeId').data().recipeid;

			// == activate save and cancel buttons
			if (editFlag == false) {
				editFlag = true;
				activateSaveCancel();
			}

			// == create save and cancel buttons for ingredients or instructions
			var updateHtml = "";

			// == save new ingedient line
			if (ingrOrInst == "ingrSave") {
				var lineType = "ingredient";
				var ingredientsData = $('#ingredientsData').data().ingredients;
				var newSequence = ingredientsData.length + 1;
				var newText = $('#newIngr').val();
				var newId = newSequence;			// no database id yet; sequence number used as temp id
				var newIngredient = {id: newId, recipe_id: recipeId, ingredient: newText, sequence: newSequence, created_at: null, updated_at: null, new_delete: "NEW"};
				ingredientsData.push(newIngredient);

				updateHtml = updateHtml + "<div class='recipeLine ui-sortable-handle' id='ingrLine_" + newSequence +  "'>";
				updateHtml = updateHtml + "<div id='ingrSeq_' class='ingrSequence'>" + newSequence +  "</div>";
				updateHtml = updateHtml + "<p class='ingredient' id='ingredient_" + newSequence + "'>" + newText + "</p>";
				updateHtml = updateHtml + "</div>";
				$('#ingredients').append(updateHtml);
				$('#ingredient_' + newSequence).on('mouseover', hiliteLink);
				$('#ingredient_' + newSequence).on('mouseout', restoreLink);
				$('#ingredient_' + newSequence).on('click', editRecipeLine);

			// == save new instruction line
		} else if (ingrOrInst == "instSave") {
				var lineType = "instruction";
				var instructionsData = $('#instructionsData').data().instructions;
				var newSequence = instructionsData.length + 1;
				var newText = $('#newInst').val();
				var newId = newSequence;			// no database id yet; sequence number used as temp id
				var newInstruction = {id: newId, recipe_id: recipeId, instruction: newText, sequence: newSequence, created_at: null, updated_at: null, new_delete: "NEW"};
				instructionsData.push(newInstruction);

				updateHtml = updateHtml + "<div class='recipeLine ui-sortable-handle' id='instLine_" + newSequence +  "'>";
				updateHtml = updateHtml + "<div id='instSeq_' class='instSequence'>" + newSequence + "</div>";
				updateHtml = updateHtml + "<p class='instruction' id='instruction_" + newSequence + "'>" + newText + "</p>";
				updateHtml = updateHtml + "</div>";
				$('#instructions').append(updateHtml);
				console.log("newSequence: ", newSequence);
				console.log("hiliteLink: ", hiliteLink);
				$('#instruction_' + newSequence).on('mouseover', hiliteLink);
				$('#instruction_' + newSequence).on('mouseout', restoreLink);
				$('#instruction_' + newSequence).on('click', editRecipeLine);
			}

			// == remove previously existing buttons if any
			$('.newRecipeLine').remove();

			displayPopup("newLine", lineType);
		}

		// ======= cancelNewLine =======
		function cancelNewLine() {
			console.log("== cancelNewLine ==");
			console.log("$(this).attr('id'): ", $(this).attr('id'));
			editFlag = false;

			// == deactivate recipe save/cancel buttons; remove new line controls
			$('#saveRecipeEdits').removeClass('active');
			$('#cancelRecipeEdits').removeClass('active');
			$('.newItem, .saveBtn, .cancelBtn').remove();
		}

		// ======= deleteRecipeLine =======
		function deleteRecipeLine() {
			console.log("== deleteRecipeLine ==");

			var nextItem;
			var itemId = currentId.split("_")[1];
			var ingrOrInst = currentId.split("_")[0];	// determine if line is ingredient or instruction

			// == identify ingredient or instruction to be removed (update local data)
			if (ingrOrInst == "ingredient") {
				var ingredientsData = $('#ingredientsData').data().ingredients;
				ingredientsInOrder = $("#ingredients").sortable("toArray");			// ingredient element ids
				for (var i = 0; i < ingredientsData.length; i++) {
					nextItem = ingredientsData[i];
					if (nextItem.id == itemId) {
						var sortableDeleteItem = "ingrLine_" + itemId;
						var deleteItemIndex = ingredientsInOrder.indexOf(sortableDeleteItem);
						ingredientsInOrder.splice(deleteItemIndex, 1);				// remove item id from inOrder list
						ingredientsData[i].new_delete = "DELETE";					// flag item for delete
					}
				}
				updateItemSequences("ingr");
			} else if (ingrOrInst == "instruction") {
				var instructionsData = $('#instructionsData').data().instructions;
				instructionsInOrder = $("#instructions").sortable("toArray");		// instruction element ids
				for (var i = 0; i < instructionsData.length; i++) {
					nextItem = instructionsData[i];
					if (nextItem.id == itemId) {
						var sortableDeleteItem = "instLine_" + itemId;
						var deleteItemIndex = instructionsInOrder.indexOf(sortableDeleteItem);
						instructionsInOrder.splice(deleteItemIndex, 1);				// remove item id from inOrder list
						instructionsData[i].new_delete = "DELETE";					// flag item for delete
					}
				}
				updateItemSequences("inst");
			}
			console.log("ingredientsData: ", ingredientsData);
			console.log("instructionsData: ", instructionsData);

			// == update html string with changes
			$('#' + currentId).parent().remove();
			$('.saveBtn, .cancelBtn, .deleteBtn').remove();

			// == activate save and cancel buttons
			activateSaveCancel();
		}


		// ======= ======= ======= recipe save/cancel/delete all edits ======= ======= =======
		// ======= ======= ======= recipe save/cancel/delete all edits ======= ======= =======
		// ======= ======= ======= recipe save/cancel/delete all edits ======= ======= =======

		// ======= deleteRecipe =======
		function deleteRecipe(recipeId) {
			console.log("== deleteRecipe ==");
			console.log("recipeId: ", recipeId);

			var url = "/delete_recipe/" + recipeId.toString();

			$.ajax({
			    url: url,
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

		// == title html
		recipeHtml = recipeHtml + "<div id='recipeBox1' class='fullBox'>";
		recipeHtml = recipeHtml + "<div class='twoThirdBox'>";
		recipeHtml = recipeHtml + "<h2 id='outputTitle'></h2>";
		recipeHtml = recipeHtml + "</div>";
		recipeHtml = recipeHtml + "<div class='oneThirdBox'></div>";
		recipeHtml = recipeHtml + "</div>";

		// == column headers html
		recipeHtml = recipeHtml + "<div id='recipeHeaders'>";
		recipeHtml = recipeHtml + "<div class='recipeHeader'>";
		recipeHtml = recipeHtml + "rating" + "</div>";
		recipeHtml = recipeHtml + "<div class='recipeHeader'>";
		recipeHtml = recipeHtml + "category" + "</div>";
		recipeHtml = recipeHtml + "<div class='recipeHeader'>";
		recipeHtml = recipeHtml + "nationality" + "</div>";
		recipeHtml = recipeHtml + "<div class='recipeHeader'>";
		recipeHtml = recipeHtml + "recipe" + "</div></div>";
		recipeHtml = recipeHtml + "<div id='recipeList'>";

		if (jsonData.recipeArray.length > 0) {
			for (var k = 0; k < jsonData.recipeArray.length; k++) {
				nextId = jsonData.recipeArray[k].id;
				nextRatingId = jsonData.recipeArray[k].rating_id;
				nextCategoryId = jsonData.recipeArray[k].category_id;
				nextNationalityId = jsonData.recipeArray[k].nationality_id;
				nextTitle = jsonData.recipeArray[k].title;

				// == rating
				if (nextRatingId) {
					ratingText = ratingObj[nextRatingId].rating[0] + ": " + ratingObj[nextRatingId].rating[1];
					ratingStyle = "color:" + ratingObj[nextRatingId].color;
				} else {
					selectedRating = "";
					ratingText = "";
					ratingStyle = "visibility:hidden";
				}

				// == category
				if (nextCategoryId) {
					categoryText = categoryObj[nextCategoryId].category;
					categoryStyle = "color:" + categoryObj[nextCategoryId].color;
				} else {
					categoryText = "";
					categoryStyle = "visibility:hidden";
				}

				// == nationality
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
		recipeHtml = recipeHtml + "</div>";
		$('#output').html(recipeHtml);
	}

	// ======= makeTitleText =======
	function makeTitleText(jsonData, type) {
		console.log("== makeTitleText ==");
		console.log("jsonData.search: ", jsonData.search);
		console.log("type: ", type);

		var titleText;
		var ratingText = "";
		var ratingObj = jsonData.ratingObj;

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
				} else if (type == "rating") {
					// ratingObj: 1=>{:id=>1, :rating=>[1, "favorite"], :color=>"#03045e"},
					ratingText = ratingText + ratingObj[jsonData.search].rating[0];
					ratingText = ratingText + ": ";
					ratingText = ratingText + ratingObj[jsonData.search].rating[1];
					titleText = "Recipes rated as '" + ratingText + "'";
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
				} else if (type == "rating") {
					// ratingObj: 1=>{:id=>1, :rating=>[1, "favorite"], :color=>"#03045e"},
					ratingText = ratingText + ratingObj[jsonData.search].rating[0];
					ratingText = ratingText + ": ";
					ratingText = ratingText + ratingObj[jsonData.search].rating[1];
					titleText = "No recipes rated as '" + ratingText + "' were found.";
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


	// ======= ======= ======= IMPORT RECIPE FILES ======= ======= =======
	// ======= ======= ======= IMPORT RECIPE FILES ======= ======= =======
	// ======= ======= ======= IMPORT RECIPE FILES ======= ======= =======

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
				displayImportedRecipes(recipeData);
				updateMenuLinks(recipeData);
			}
			fr.readAsText(this.files[0]);
		})
	}

	// ======= displayImportedRecipes =======
    function displayImportedRecipes(recipeData) {
        console.log("== displayImportedRecipes ==");

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
			recipeHtml = recipeHtml + "<p class='newRecipeLabel'>ingredients</p>";

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
				nextHtml = "<p class='newIngredient'>" + nextText + "</p>";
				recipeHtml = recipeHtml + nextHtml;
			}

			recipeHtml = recipeHtml + "<p class='newRecipeLabel'>instructions</p>";

			// instructionObj = {instruction:___, duration:___, durUnits:___};
			for (var k = 0; k < nextInstructions.length; k++) {
				nextInstruction = nextInstructions[k].instruction;
				nextDuration = nextInstructions[k].duration;
				nextDurUnits = nextInstructions[k].durUnits;
				nextHtml = "<p class='newInstruction'>" + nextInstruction + "</p>";
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
			var dataType = "json";
		} else {
			var url = "/save_recipe_edits";
			var dataType = "script";
		}

		var jsonData = JSON.stringify(recipeData);

		$.ajax({
		    url: url,
			data: jsonData,
		    method: "POST",
			dataType: dataType,
			contentType: "application/json; charset=utf-8"
		}).done(function(jsonData) {
		    console.log("*** ajax success ***");
		    console.dir(jsonData);
			if (importEdit == "import") {
				updateImportLink("import recipes");
			}
			updateNoticeMessage(jsonData);
			updateLocalIngrinst(jsonData);
		}).fail(function(unknown){
		    console.log("*** ajax fail ***");
			console.log("unknown:", unknown);
		});
	}


	// ======= ======= ======= UTILITIES ======= ======= =======
	// ======= ======= ======= UTILITIES ======= ======= =======
	// ======= ======= ======= UTILITIES ======= ======= =======

	// ======= updateSequenceDisplay =======
	function updateSequenceDisplay() {
		console.log("== updateSequenceDisplay ==");
		var ingredientsData = $('#ingredientsData').data().ingredients;
		var instructionsData = $('#instructionsData').data().instructions;

		var nextIngredientId, nextIngredientSeq, nextInstructionId, nextInstructionSeq;

		for (var i = 0; i < ingredientsData.length; i++) {
			nextIngredientId = ingredientsData[i].id.toString();
			nextIngredientSeq = ingredientsData[i].sequence.toString();
			nextSequenceDiv = $('#ingrSeq_' + nextIngredientId);
			nextSequenceDiv.text(nextIngredientSeq);
		}
		for (var j = 0; j < instructionsData.length; j++) {
			nextInstructionId = instructionsData[j].id.toString();
			nextInstructionSeq = instructionsData[j].sequence.toString();
			nextSequenceDiv = $('#instSeq_' + nextInstructionId);
			nextSequenceDiv.text(nextInstructionSeq);
		}
	}

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


});
