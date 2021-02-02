$(document).on('turbolinks:load', function() {
    console.log("== turbolinks:load ==");

    // ======= check pathname =======
    var pathname = window.location.pathname;
	var pathParts = pathname.split("/");
    var pathPartsCount = (pathname.split("/").length - 1);
	console.log("pathParts: ", pathParts);

	// ======= window size displays =======
	var windowFlag = 1150;
	var windowW = $(window).width();
	if (windowW < windowFlag) {
		$('#getMyRecipes').text('My');
		$('#getAllRecipes').text('All');
	} else {
		$('#getMyRecipes').text('My Recipes');
		$('#getAllRecipes').text('All Recipes');
	}

	$(window).on('resize', function() {
	  if ($(this).width() !== windowW) {
	    windowW = $(this).width();
		if (windowW < windowFlag) {
			$('#getMyRecipes').text('My');
			$('#getAllRecipes').text('All');
		} else {
			$('#getMyRecipes').text('My Recipes');
			$('#getAllRecipes').text('All Recipes');
		}
	  }
	});

	if (!stateObj) {
		var stateObj = {
			userAction: "",				// handler seletion

			url: "",					// search
			searchType: "",
			searchTerm: "",

			recipeArray: [],			// list
			selectedItemsArray: [],
			sortTerm: "",

			whichRecipe: 1,
			recipeTitle: 1,
			userRating: 1,
			category: 1,
			nationality: 1,
			shared: true,

			titleText: "",				// display
			noticeText: "",

			headersActive: true,
			titleEditable: true,
			linesEditable: true,
			showEditButtons: true,
			saveCancelVisible: true
		}
		console.log("stateObj: ", stateObj);
	}




	// ======= ======= ======= DRAG-AND-DROP ======= ======= =======
	// ======= ======= ======= DRAG-AND-DROP ======= ======= =======
	// ======= ======= ======= DRAG-AND-DROP ======= ======= =======

	// ======= activateSortableLists =======
    function activateSortableLists() {
		console.log("== activateSortableLists ==");

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
				editFlag = true;
				activateSaveCancel();						// ingredient moved: enable save/cancel buttons
				self.updateItemPositions(ui.item);			// ui.item is container div for ingredient sequence/text
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
				editFlag = true;
				activateSaveCancel();						// instruction moved: enable save/cancel buttons
				updateItemPositions(ui.item);				// ui.item is container div for instruction sequence/text
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

			// ======= update sort arrays =======
			if (newIndex != startIndex) {
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
				nextItemSeq = $(nextItemEl).children()[0];			// sequence number element is first child
				nextItemSeq.innerHTML = (i + 1).toString();			// set new element sequence number

				// == cycle through local database data to update sequence numbers
				for (var j = 0; j < localDataItems.length; j++) {
					checkItemId = localDataItems[j].id;

					// == existing item (id is the id integer from database)
					if (!isNaN(checkItemId)) {
						if (checkItemId == nextItemNum) {
							if (ingrOrInst == "ingr") {
								$('#ingredientsData').data().ingredients[j].sequence = i + 1;
							} else {
								$('#instructionsData').data().instructions[j].sequence = i + 1;
							}
						}

					// == new item (id integer "XX" determined from count of items; format: NEW_XX)
					} else {
						checkItemNum = checkItemId.split("_")[1];	// get new item "id"
						if (checkItemNum == nextItemNum) {
							if (ingrOrInst == "ingr") {
								$('#ingredientsData').data().ingredients[j].sequence = i + 1;
							} else {
								$('#instructionsData').data().instructions[j].sequence = i + 1;
							}
						}
					}
				}
			}
		}
	}


	// ======= ======= ======= PAGE-SPECIFIC BEHAVIORS ======= ======= =======
	// ======= ======= ======= PAGE-SPECIFIC BEHAVIORS ======= ======= =======
	// ======= ======= ======= PAGE-SPECIFIC BEHAVIORS ======= ======= =======


	// ======= initialize variables =======
	var recipesArray = [];		// will contain any imported recipe file data
	var editFlag = false;		// stays false until recipe data is changed
	var noShowFlag = false;		// false: allows for popup display (noShow unchecked)

	activateSelectItem();
	activateSearchMenu();
	activateBackBtn();


	// ======= import recipes =======
    if (pathname == "/import_recipes") {

		activateFileCancel();
		loadFileReader();


	// ======= type/enter new recipe line-by-line =======
	} else if (pathname == "/type_recipe") {

		activateSortableLists();
		activateTitleBtns();
		activateEditMenu();

		// ======= init unedited sort order =======
		var ingredientsInOrder = $("#ingredients").sortable("toArray");		// ingredient element ids
		var instructionsInOrder = $("#instructions").sortable("toArray");	// instruction element ids

		// == hide classify/share functions to enable title edit text box
		$('#rating_edit_select').hide();
		$('#category_edit_select').hide();
		$('#nationality_edit_select').hide();
		$('#deleteRecipe').hide();
		$('#shared').hide();
		$('.label').hide();

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
			$('#sharedData').data().prev_shared = $('#sharedData').data().shared;
			$('#ratingData').data().prev_ratingid = $('#ratingData').data().ratingid;
			$('#userRatingData').data().prev_userratingid = $('#userRatingData').data().userratingid;
			$('#categoryData').data().prev_categoryid = $('#categoryData').data().categoryid;
			$('#nationalityData').data().prev_nationalityid = $('#nationalityData').data().nationalityid;

			// ======= enable ingredients/instructions editing =======
			activateSortableLists()
			activateEditMenu();
			activateLineEdits();

			// ======= init unedited sort order =======
			var ingredientsInOrder = $("#ingredients").sortable("toArray");		// ingredient element ids
			var instructionsInOrder = $("#instructions").sortable("toArray");	// instruction element ids

		} else if ((pathParts[1] == "ratings") || (pathParts[1] == "categories") || (pathParts[1] == "nationalities")) {
			activateClassifyActions();
		}
	}


	// ======= ======= ======= RECIPE SEARCH MENU ======= ======= =======
	// ======= ======= ======= RECIPE SEARCH MENU ======= ======= =======
	// ======= ======= ======= RECIPE SEARCH MENU ======= ======= =======

	// ======= activateBackBtn =======
	function activateBackBtn() {
		console.log("== activateBackBtn ==");

		$('#backBtn').off("click", loadPrevPage);
		$('#backBtn').on("click", loadPrevPage);

		function loadPrevPage(e) {
			console.log("== click: backBtn ==");
			console.log("stateObj: ", stateObj);
			e.preventDefault();
			e.stopPropagation();
		}
	}

	// ======= activateSearchMenu =======
    function activateSearchMenu() {
		console.log("== activateSearchMenu ==");

		// == show my recipes
		$('#getMyRecipes').click(function(e) {
			console.log("== click: getMyRecipes ==");
			e.preventDefault();
			if (editFlag == false) {
				toggleEditButtons("hide");
				makeSearchRequest("", "my");
			} else {
				displayPopup("edit", "");		// prevent new display if edits are unsaved
			}
			e.stopPropagation();
		});

		// == show all recipes
		$('#getAllRecipes').click(function(e) {
			console.log("== click: getAllRecipes ==");
			e.preventDefault();
			if (editFlag == false) {
				toggleEditButtons("hide");
				makeSearchRequest("", "all");
			} else {
				displayPopup("edit", "");		// prevent new display if edits are unsaved
			}
			e.stopPropagation();
		});

		// == search for text in title
		$('#searchInBtn > div > a:nth-of-type(1)').click(function(e) {
			console.log("== click: searchInBtn ==");
			e.preventDefault();
			var searchValue = $('#searchInput').val();
			console.log("searchValue: ", searchValue);
			if (searchValue != "") {
				if (editFlag == false) {
					toggleEditButtons("hide");
					makeSearchRequest("title", "text");
				} else {
					displayPopup("edit", "");		// prevent new display if edits are unsaved
				}
			} else {
				displayPopup("search", "");			// prevent new display if no search value
			}
			e.stopPropagation();
		});

		// == search for text in ingredients
		$('#searchInBtn > div > a:nth-of-type(2)').click(function(e) {
			console.log("== click: searchInBtn ==");
			e.preventDefault();
			var searchValue = $('#searchInput').val();
			if (searchValue != "") {
				if (editFlag == false) {
					toggleEditButtons("hide");
					makeSearchRequest("ingredients", "text");
				} else {
					displayPopup("edit", "");		// prevent new display if edits are unsaved
				}
			} else {
				displayPopup("search", "");			// prevent new display if no search value
			}
			e.stopPropagation();
		});

		// == search by rating
		$('#searchRating > div > a').click(function(e) {
			console.log("== click: searchRating ==");
			e.preventDefault();
			if (editFlag == false) {
				toggleEditButtons("hide");
				var searchString = $(this).attr('id').split('_')[1];
				if (searchString.length == 0) {
					makeTitleText("", "no search");
				} else {
					makeSearchRequest(searchString, "rating");
				}
			} else {
				displayPopup("edit", "");			// prevent new display if edits are unsaved
			}
			e.stopPropagation();
	    });

		// == search by category
		$('#searchCategory > div > a').click(function(e) {
			console.log("== click: searchCategory ==");
			e.preventDefault();
			if (editFlag == false) {
				toggleEditButtons("hide");
				var searchString = $(this).attr('id').split('_')[1];
				if (searchString.length == 0) {
					makeTitleText("", "no search");
				} else {
					makeSearchRequest(searchString, "category");
				}
			} else {
				displayPopup("edit", "");			// prevent new display if edits are unsaved
			}
			e.stopPropagation();
	    });

		// == search by nationality
		$('#searchNationality > div > a').click(function(e) {
			console.log("== click: searchNationality ==");
			e.preventDefault();
			if (editFlag == false) {
				toggleEditButtons("hide");
				var searchString = $(this).attr('id').split('_')[1];
				if (searchString.length == 0) {
					makeTitleText("", "no search");
				} else {
					makeSearchRequest(searchString, "nationality");
				}
			} else {
				displayPopup("edit", "");			// prevent new display if edits are unsaved
			}
			e.stopPropagation();
	    });
	}

	// ======= ======= ======= SEARCH REQUEST ======= ======= =======
	// ======= ======= ======= SEARCH REQUEST ======= ======= =======
	// ======= ======= ======= SEARCH REQUEST ======= ======= =======

	function makeSearchRequest(searchString, searchType) {
		console.log("== makeSearchRequest ==");
		console.log("searchString: ", searchString);
		console.log("searchType: ", searchType);

		switch (searchType) {
			case "my":
				var url = "/my_recipes";
				break;
			case "all":
				var url = "/all_recipes";
				break;
			case "text":
				var searchText = $('#searchInput').val();	// search text for title or ingredients
				searchString = [searchString, searchText];	// pass type and title/ingredient selection
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
		stateObj.url = url;
		stateObj.searchType = searchType;
		stateObj.searchTerm = searchString;
		console.log("stateObj: ", stateObj);

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
			activateListHeaders();
			makeTitleText(jsonData, searchType);
			updateNoticeMessage(jsonData);
			deactivateTitleEdit();				// title edit functionality is not for recipe lists (specific recipe only)
		}).fail(function(unknown){
			console.log("*** ajax fail ***");
			console.log("unknown:", unknown);
		});
	}


	// ======= ======= ======= RECIPE EDIT MENU ======= ======= =======
	// ======= ======= ======= RECIPE EDIT MENU ======= ======= =======
	// ======= ======= ======= RECIPE EDIT MENU ======= ======= =======

	// ======= activateEditMenu =======
    function activateEditMenu() {
		console.log("== activateEditMenu ==");

		var btnColor;
		var textColor;
		var currentText, currentId;

		// == set recipe rating
		$('#rating_edit_select').change(function(e) {
			console.log("== change: rating_edit_select ==");
			e.preventDefault();
			editFlag = true;

			// == temporarily store previous value for this item (rating)
			$('#ratingData').data().prev_ratingid = $('#ratingData').data().ratingid;
			$('#ratingData').data().ratingid = $('#rating_edit_select option:selected').val();
			console.log("$('#ratingData').data().prev_ratingid: ", $('#ratingData').data().prev_ratingid);
			console.log("$('#ratingData').data().ratingid: ", $('#ratingData').data().ratingid);

			// == activate save and cancel buttons
			activateSaveCancel();
	    });

		// == set recipe category
		$('#category_edit_select').change(function(e) {
			console.log("== change: category_edit_select ==");
			e.preventDefault();
			editFlag = true;

			// == temporarily store previous value for this item (category)
			$('#categoryData').data().prev_categoryid = $('#categoryData').data().categoryid;
			$('#categoryData').data().categoryid = $('#category_edit_select option:selected').val();

			// == activate save and cancel buttons
			activateSaveCancel();
	    });

		// == set recipe nationality
		$('#nationality_edit_select').change(function(e) {
			console.log("== change: nationality_edit_select ==");
			e.preventDefault();
			editFlag = true;

			// == temporarily store previous value for this item (nationality)
			$('#nationalityData').data().prev_nationalityid = $('#nationalityData').data().nationalityid;
			$('#nationalityData').data().nationalityid = $('#nationality_edit_select option:selected').val();

			// == activate save and cancel buttons
			activateSaveCancel();
	    });

		// == set shared status
		$('#shared').change(function(e) {
			console.log("== change: recipeShare ==");
			e.preventDefault();

			editFlag = true;

			var shared = $(this).val();
			if (shared === "true") {
				shared = "false";
			} else if (shared === "false") {
				shared = "true";
			}
			$('#sharedData').data().prev_shared = $('#sharedData').data().shared;
			$('#sharedData').data().shared = shared;

			// == activate save and cancel buttons
			activateSaveCancel();
	    });

		// == select to delete recipe entirely from database
		$('#deleteRecipe').click(function(e) {
			console.log("== click: deleteRecipe ==");
			e.preventDefault();
			editFlag = false;
			deleteRecipe($('#recipeId').data().recipeid);
			e.stopPropagation();
		});
	}


	// ======= ======= ======= EDIT RECIPE ======= ======= =======
	// ======= ======= ======= EDIT RECIPE ======= ======= =======
	// ======= ======= ======= EDIT RECIPE ======= ======= =======

	// ======= activateLineEdits =======
	function activateLineEdits() {
		console.log("== activateLineEdits ==");

		$('#outputTitle').on('mouseover', hiliteLink);
		$('#outputTitle').on('mouseout', restoreLink);
		$('#outputTitle').on('click', editRecipeTitle);
		$('.ingredient, .instruction').on('mouseover', hiliteLink);
		$('.ingredient, .instruction').on('mouseout', restoreLink);
		$('.ingredient, .instruction').on('click', editRecipeLine);
		$('.addBtn').on('click', inputNewLine);

		// == allow return key entry for new ingredients or instructions
		$('body').on('keyup', function(e) {
			console.log("== keyup: saveNewLine ==");
			if ((e.keyCode === 13) && ($(':focus').attr('id') === 'newIngr')) {
				saveNewLine("ingrSave");
			} else if ((e.keyCode === 13) && ($(':focus').attr('id') === 'newInst')) {
				saveNewLine("instSave");
			}
		});
	}


	// ======= ======= ======= EDIT TITLE ======= ======= =======
	// ======= ======= ======= EDIT TITLE ======= ======= =======
	// ======= ======= ======= EDIT TITLE ======= ======= =======

	// ======= editRecipeTitle =======
	function editRecipeTitle() {
		console.log("== editRecipeTitle ==");

		// == store existing title text (for restore if edits cancelled)
		currentText = $(this).text();

		$('#rating_edit_select').hide();
		$('#category_edit_select').hide();
		$('#nationality_edit_select').hide();
		$('#deleteRecipe').hide();
		$('#shared').hide();
		$('.label').hide();

		// == create textbox and button controls for revised title
		var inputHtml = "<input type='text' id='editTitleText' name='editTitleText' value='" + currentText + "'>";
		var btnsHtml = "<div id='titleSaveBtn' class='saveBtn'> save </div> <div id='titleCancelBtn' class='cancelBtn'> cancel </div> ";
		var editHtml = inputHtml + btnsHtml;
		$(this).replaceWith(editHtml);
		activateTitleBtns();

	}

	// ======= revealAddBtns =======
	function revealAddBtns() {
		console.log("== revealAddBtns ==");
		$('#ingrAdd').css('color', 'navy');
		$('#ingrAdd').css('background-color', 'Plum');
		$('#instAdd').css('color', 'navy');
		$('#instAdd').css('background-color', 'Plum');

		$('#instAdd, #ingrAdd').hover(function() {
			console.log("== hover ==");
			$(this).css("color", "red");
			$(this).css("background-color", "navy");
			},
			function() {
			$(this).css("color", "navy");
			$(this).css("background-color", "Plum");
		});
	}

	// ======= activateTitleBtns =======
	function activateTitleBtns() {
		console.log("== activateTitleBtns ==");

		$('.saveBtn').click(function(e) {
			e.preventDefault();
			editFlag = true;
			updateRecipeTitle();
			if (pathname == "/type_recipe") {
				var newText = $('#editTitleText').val();
				if (newText != "") {
					revealAddBtns();
				}
			}
			e.stopPropagation();
		});

		// == type_recipe view does not have cancel btn
		var titleText = $('#outputTitle').text();
		var editTitleText = $('#editTitleText').val();

		if ((pathname == "/type_recipe") && (editTitleText === "")) {
			$('.cancelBtn').click(function(e) {
				window.location = "/";
			});
		} else {
			$('.cancelBtn').click(function(e) {
				e.preventDefault();
				cancelTitleEdits(editTitleText);
				e.stopPropagation();
			});
		}
	}

	// ======= updateRecipeTitle =======
	function updateRecipeTitle() {
		console.log("== updateRecipeTitle ==");

		var newText = $('#editTitleText').val();
		var currentId = $(this).attr('id');
		if (!currentId) {
			currentId = "outputTitle";
		}

		if (newText == "") {
			displayPopup("noText", "title");
		} else {
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

			activateSaveCancel();
			toggleEditButtons("show");
			if (pathParts[1] == "type_recipe") {
				activateLineEdits();
			}
		}
	}

	// ======= cancelTitleEdits =======
	function cancelTitleEdits(currentText) {
		console.log("== cancelTitleEdits ==");

		// == restore html string
		var saveHtml = "<h2 id='outputTitle'>" + currentText + "</h2>";
		$('#editTitleText').replaceWith(saveHtml);
		$('.saveBtn, .cancelBtn').remove();

		$('#rating_edit_select').show();
		$('#category_edit_select').show();
		$('#nationality_edit_select').show();
		$('#deleteRecipe').show();
		$('#shared').show();
		$('.label').show();

		// == restore line hilites and click behavior
		$('#outputTitle').on('mouseover', hiliteLink);
		$('#outputTitle').on('mouseout', restoreLink);
		$('#outputTitle').on('click', editRecipeTitle);
	}


	// ======= ======= ======= EDIT LINES ======= ======= =======
	// ======= ======= ======= EDIT LINES ======= ======= =======
	// ======= ======= ======= EDIT LINES ======= ======= =======

	// ======= editRecipeLine =======
	function editRecipeLine() {
		console.log("== editRecipeLine ==");

		editFlag = true;
		var btnsHtml = "";
		var inputHtml = "";

		// == get existing id and text values for currently selected element
		currentText = $(this).text();
		currentId = $(this).attr('id');

		// == currentId format: ingredient_XXXX or instruction_XXXX (XXXX = database id)
		var itemId = currentId.split("_")[1];
		var ingrOrInst = currentId.split("_")[0];	// determine if line is ingredient or instruction

		// == remove existing edit mode elements if any/restore line functionality
		if ($('.editLineBox').length > 0) {
			var activeEditId = $('.editLineBox').children('textarea').attr('id');
			var activeEditText = $('.editLineBox').children('textarea').text();
			var saveHtml = "<p class='" + ingrOrInst + "' id='" + activeEditId + "'>" + activeEditText + "</p>";
			$('.editLineBox').replaceWith(saveHtml);
			$('#' + activeEditId).on('mouseover', hiliteLink);
			$('#' + activeEditId).on('mouseout', restoreLink);
			$('#' + activeEditId).on('click', editRecipeLine);
		}

		// == replace selected line with edit functionality
		inputHtml = inputHtml + "<div class='editLineBox'>";
		inputHtml = inputHtml + "<textarea class='editItem' id='" + currentId + "' name='" + currentId + "'";
		inputHtml = inputHtml + " cols='40' rows='5'>" + currentText + "</textarea>";
		var btnsHtml = btnsHtml + "<div class='editBtnsBox'>";
		var btnsHtml = btnsHtml + "<div class='saveBtn'>save</div>";
		var btnsHtml = btnsHtml + "<div class='cancelBtn'>cancel</div>";
		var btnsHtml = btnsHtml + "<div class='deleteBtn'>delete</div> ";
		var btnsHtml = btnsHtml + "</div></div>";
		var editHtml = inputHtml + btnsHtml;
		$(this).replaceWith(editHtml);

		// == activate save/cancel/delete buttons
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
		if (ingrOrInst == "ingredient") {
			for (var i = 0; i < ingredientsData.ingredients.length; i++) {
				nextId = ingredientsData.ingredients[i].id;
				nextSequence = parseInt($('#ingrSeq_' + nextId).text());
				ingredientsData.ingredients[i].sequence = nextSequence;
				if (nextId == itemId) {
					ingredientsData.ingredients[i].ingredient = newText;
					break;
				}
			}

		// == save instruction changes to local data
		} else if (ingrOrInst == "instruction") {
			for (var i = 0; i < instructionsData.instructions.length; i++) {
				nextId = instructionsData.instructions[i].id;
				nextSequence = parseInt($('#instSeq_' + nextId).text());
				instructionsData.instructions[i].sequence = nextSequence;
				if (nextId == itemId) {
					instructionsData.instructions[i].instruction = newText;
					break;
				}
			}
		}

		// == update html string with changes
		var saveHtml = "<p class='" + ingrOrInst + "' id='" + currentId + "'>" + newText + "</p>";
		$('.editLineBox').replaceWith(saveHtml);

		// == restore line hilites and click behavior
		$('#' + currentId).on('mouseover', hiliteLink);
		$('#' + currentId).on('mouseout', restoreLink);
		$('#' + currentId).on('click', editRecipeLine);

		// == activate save and cancel buttons
		activateSaveCancel();
	}

	// ======= deleteRecipeLine =======
	function deleteRecipeLine() {
		console.log("== deleteRecipeLine ==");

		var nextItem;
		var itemId = currentId.split("_")[1];
		var ingrOrInst = currentId.split("_")[0];	// determine if line is ingredient or instruction
		console.log("itemId: ", itemId);

		// == identify ingredient or instruction to be removed (update local data)
		if (ingrOrInst == "ingredient") {
			var sequenceElement = $('#ingrSeq_' + itemId);
			var ingredientsData = $('#ingredientsData').data().ingredients;
			ingredientsInOrder = $("#ingredients").sortable("toArray");			// ingredient element ids
			for (var i = 0; i < ingredientsData.length; i++) {
				nextItem = ingredientsData[i];
				if (nextItem.id == itemId) {
					var sortableDeleteItem = "ingrLine_" + itemId;
					var deleteItemIndex = ingredientsInOrder.indexOf(sortableDeleteItem);
					ingredientsInOrder.splice(deleteItemIndex, 1);				// remove item id from inOrder list
					ingredientsData[i].new_delete = "DELETE";					// flag item for delete
					$('#ingrLine_' + itemId).remove();
				}
			}
			updateItemSequences("ingr");

		} else if (ingrOrInst == "instruction") {
			var sequenceElement = $('#instSeq_' + itemId);
			var instructionsData = $('#instructionsData').data().instructions;
			instructionsInOrder = $("#instructions").sortable("toArray");		// instruction element ids
			console.log("instructionsInOrder1: ", instructionsInOrder);
			for (var i = 0; i < instructionsData.length; i++) {
				nextItem = instructionsData[i];
				if (nextItem.id == itemId) {
					var sortableDeleteItem = "instLine_" + itemId;
					var deleteItemIndex = instructionsInOrder.indexOf(sortableDeleteItem);
					instructionsInOrder.splice(deleteItemIndex, 1);				// remove item id from inOrder list
					instructionsData[i].new_delete = "DELETE";					// flag item for delete
					$('#instLine_' + itemId).remove();
					console.log("instructionsInOrder2: ", instructionsInOrder);
				}
			}
			updateItemSequences("inst");
		}

		// == update html string with changes
		sequenceElement.remove();
		$('#' + currentId).parent().remove();

		// == activate save and cancel buttons
		activateSaveCancel();
	}

	// ======= cancelLineEdits =======
	function cancelLineEdits() {
		console.log("== cancelLineEdits ==");
		editFlag = false;

		// == currentId format: ingredient_XXXX or instruction_XXXX (XXXX = database id)
		var itemId = currentId.split("_")[1];
		var ingrOrInst = currentId.split("_")[0];	// determine if line is ingredient or instruction
		var saveHtml = "<p class='" + ingrOrInst + "' id='" + currentId + "'>" + currentText + "</p>";
		$('.editLineBox').replaceWith(saveHtml);
		$('#' + currentId).on('mouseover', hiliteLink);
		$('#' + currentId).on('mouseout', restoreLink);
		$('#' + currentId).on('click', editRecipeLine);
	}


	// ======= ======= ======= NEW LINES ======= ======= =======
	// ======= ======= ======= NEW LINES ======= ======= =======
	// ======= ======= ======= NEW LINES ======= ======= =======

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
			editHtml = editHtml + "<div class='saveBtn' id='ingrSave'> save </div>";
			editHtml = editHtml + "<div class='cancelBtn' id='ingrCancel'> cancel </div>";
			editHtml = editHtml + "</div>";
			$('#ingredients').prepend(editHtml);
			$('#newIngr').focus();
		} else if (ingrOrInst == "instAdd") {
			var instCount = $('#instructions').children().length + 1;
			editHtml = editHtml + "<div id='instLine_" + instCount + "' class='recipeLine newRecipeLine iu-sortable-handle'>";
			editHtml = editHtml + "<input type='text' class='newItem' id='newInst' name='newInst'>";
			editHtml = editHtml + "<div class='saveBtn' id='instSave'> save </div>";
			editHtml = editHtml + "<div class='cancelBtn' id='instCancel'> cancel </div>";
			editHtml = editHtml + "</div>";
			$('#instructions').prepend(editHtml);
			$('#newInst').focus();
		}

		$('.saveBtn').on('click', saveNewLine);
		$('.cancelBtn').on('click', cancelNewLine);
	}

	// ======= saveNewLine =======
	function saveNewLine(ingrOrInst) {
		console.log("== saveNewLine ==");
		console.log("ingrOrInst: ", ingrOrInst);
		console.log("$.type(ingrOrInst): ", $.type(ingrOrInst));

		// == determine if ingredient or instruction add button was clicked
		if ($.type(ingrOrInst) === 'object') {
			console.log("*** button click");
			console.log("ingrOrInst.currentTarget: ", ingrOrInst.currentTarget);
			console.log("ingrOrInst.currentTarget.id: ", ingrOrInst.currentTarget.id);
			ingrOrInst = ingrOrInst.currentTarget.id;
		}

		// == determine if ingredient or instruction is being entered
		if (ingrOrInst == "ingrSave") {
			var newText = $('#newIngr').val();
			var lineType = "ingredient";
		} else if (ingrOrInst == "instSave") {
			var newText = $('#newInst').val();
			var lineType = "instruction";
		}

		if (newText != "") {
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
				var ingredientsData = $('#ingredientsData').data().ingredients;
				console.log("ingredientsData: ", ingredientsData);
				if (ingredientsData.length == null) {		// no ingredients data on type recipe page yet
					var newSequence = 1;
				} else {
					var newSequence = ingredientsData.length + 1;
				}
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
				var instructionsData = $('#instructionsData').data().instructions;
				if (instructionsData.length == null) {		// no instructions data on type recipe page yet
					var newSequence = 1;
				} else {
					var newSequence = instructionsData.length + 1;
				}
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
			if (pathname != "/type_recipe") {
				displayPopup("newLine", lineType);
			}
		} else {
			displayPopup("noText", lineType);
		}
	}

	// ======= cancelNewLine =======
	function cancelNewLine() {
		console.log("== cancelNewLine ==");
		editFlag = false;

		// == deactivate recipe save/cancel buttons; remove new line controls
		$('.newRecipeLine, .newItem, .saveBtn, .cancelBtn').remove();
	}


	// ======= ======= ======= EDIT REQUEST ======= ======= =======
	// ======= ======= ======= EDIT REQUEST ======= ======= =======
	// ======= ======= ======= EDIT REQUEST ======= ======= =======

	// ======= activateSaveCancel =======
	function activateSaveCancel() {
		console.log("== activateSaveCancel ==");

		console.log("editFlag: ", editFlag);

		// == select to send changes to database
		if (editFlag) {
			$('#recipeBox2').css('display', 'block');		// edits have been made; show save or cancel options
			$('#saveRecipeEdits').off('click');
			$('#saveRecipeEdits').click(function(e) {
				console.log("== click: saveRecipeEdits ==");
				e.preventDefault();
				editFlag = false;
				saveRecipeEdits();
				e.stopPropagation();
			});
			$('#cancelRecipeEdits').off('click');
			$('#cancelRecipeEdits').click(function(e) {
				console.log("== click: cancelRecipeEdits ==");
				e.preventDefault();
				editFlag = false;
				cancelRecipeEdits();
				e.stopPropagation();
			});
		}
	}

	// ======= saveRecipeEdits =======
	function saveRecipeEdits() {
		console.log("== saveRecipeEdits ==");

		var nextItem, nextItemId, nextIngredientId, nextInstructionId;

		// == deactivate save and cancel buttons
		editFlag = false;

		// == get local data for Ajax send
		var recipeId = $('#recipeId').data().recipeid;
		var sharedData = $('#sharedData').data().shared;
		var titleData = $('#titleData').data().title;
		var ratingData = $('#ratingData').data().ratingid;
		var userRatingData = $('#userRatingData').data().userratingid;
		var categoryData = $('#categoryData').data().categoryid;
		var nationalityData = $('#nationalityData').data().nationalityid;
		var ingredientsData = $('#ingredientsData').data().ingredients;		// with NEW or DELETE flag (if any) and revised text
		var instructionsData = $('#instructionsData').data().instructions;	// with NEW or DELETE flag (if any) and revised text
		console.log("userRatingData: ", userRatingData);

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
		if (!userRatingData.userratingid) {
			userRatingData.userratingid = 0;
		}
		if (!sharedData.shared) {
			sharedData.shared = 0;
		}

		// == package data for send
		var recipeData = {
			recipe_id: recipeId,
			shared: sharedData,
			title: titleData,
			rating_id: ratingData,
			category_id: categoryData,
			nationality_id: nationalityData,
			user_rating_id: userRatingData,
			ingredients: ingredientsData,
			instructions: instructionsData
		};

		//== return saved data to database
		saveRecipeData(recipeData, "edit");
	}

	// ======= cancelRecipeEdits =======
	function cancelRecipeEdits() {
		console.log("== cancelRecipeEdits ==");
		location.reload();
	}

	// ======= saveRecipeData =======
	function saveRecipeData(recipeData, importEdit) {
		console.log("== saveRecipeData ==");

		if (importEdit == "import") {
			var url = "/save_recipe_file";
			var dataType = "json";
		} else if (importEdit == "edit"){
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
				displayRecipeTitles(jsonData);
				activateListHeaders();
				makeTitleText(jsonData, "import");
			}
			updateNoticeMessage(jsonData);
		}).fail(function(unknown){
		    console.log("*** ajax fail ***");
			console.log("unknown:", unknown);
		});
	}

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
			displayDeleteView(jsonData);
		}).fail(function(unknown){
			console.log("*** ajax fail ***");
			console.log("unknown:", unknown);
		});
	}

	// ======= displayDeleteView =======
	function displayDeleteView(jsonData) {
		console.log("== displayDeleteView ==");
		var recipeTitle = jsonData.title;
		var htmlText = "";
		htmlText = htmlText + "<div class='recipeBox1'><h2 id='outputTitle'>" + recipeTitle + "</h2></div>";
		htmlText = htmlText + "<div id='recipeBox2'><div class='halfBox'></div><div class='halfBox'></div></div>"
		htmlText = htmlText + "<div id='welcomeText' class='middleBox'> <p>" + recipeTitle + "</span> has been deleted.</p></div>"
		$('#output').html(htmlText);
	}


	// ======= ======= ======= DISPLAY RECIPE TITLES ======= ======= =======
	// ======= ======= ======= DISPLAY RECIPE TITLES ======= ======= =======
	// ======= ======= ======= DISPLAY RECIPE TITLES ======= ======= =======

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
		recipeHtml = recipeHtml + "<div class='menuBox1'>";
		recipeHtml = recipeHtml + "<h2 id='outputTitle'></h2></div>";

		// == column headers html
		recipeHtml = recipeHtml + "<table class='menuList'><thead>";
		recipeHtml = recipeHtml + "<tr class='menuHeaders'>";
		recipeHtml = recipeHtml + "<th id='shareHeader' class='menuListHeader'>shared</th>";
		recipeHtml = recipeHtml + "<th id='ratingHeader' class='menuListHeader'>avg rating</th>";
		recipeHtml = recipeHtml + "<th id='userRatingHeader' class='menuListHeader'>your rating</th>";
		recipeHtml = recipeHtml + "<th id='categoryHeader' class='menuListHeader'>category</th>";
		recipeHtml = recipeHtml + "<th id='nationalityHeader' class='menuListHeader'>nationality</th>";
		recipeHtml = recipeHtml + "<th id='titleHeader' class='menuListHeader'>title</th>";
		recipeHtml = recipeHtml + "<th id='selectHeader' class='menuListHeader'>select</th>";
		recipeHtml = recipeHtml + "</tr></thead><tbody>";

		if (jsonData.recipeArray.length > 0) {

			// ======= loop through recipeArray =======
			for (var k = 0; k < jsonData.recipeArray.length; k++) {
				nextId = jsonData.recipeArray[k].id;
				nextShared = jsonData.recipeArray[k].shared;
				nextRatingId = jsonData.recipeArray[k].rating_id;
				nextUserRatingId = jsonData.recipeArray[k].user_rating_id;
				nextCategoryId = jsonData.recipeArray[k].category_id;
				nextNationalityId = jsonData.recipeArray[k].nationality_id;
				nextTitle = jsonData.recipeArray[k].title;

				// == average rating
				if (nextRatingId) {
					ratingText = ratingObj[nextRatingId].rating[1];
					ratingStyle = "color:" + ratingObj[nextRatingId].color;
				} else {
					selectedRating = "&nbsp;";
					ratingText = "&nbsp;";
					ratingStyle = "";
				}

				// == user rating
				if (nextUserRatingId) {
					userRatingText = ratingObj[nextUserRatingId].rating[1];
					userRatingStyle = "color:" + ratingObj[nextUserRatingId].color;
				} else {
					selectedRating = "&nbsp;";
					userRatingText = "&nbsp;";
					userRatingStyle = "";
				}

				// == category
				if (nextCategoryId) {
					categoryText = categoryObj[nextCategoryId].category;
					categoryStyle = "color:" + categoryObj[nextCategoryId].color;
				} else {
					categoryText = "&nbsp;";
					categoryStyle = "";
				}

				// == nationality
				if (nextNationalityId) {
					nationalityText = nationalityObj[nextNationalityId].nationality;
					nationalityStyle = "color:" + nationalityObj[nextNationalityId].color;
				} else {
					nationalityText = "&nbsp;";
					nationalityStyle = "";
				}

				// == stylized table row/columns for each returned recipe
				recipeHtml = recipeHtml + "<tr>";
				recipeHtml = recipeHtml + "<td class='menuListItem'>";
				if (!nextShared) {
					recipeHtml = recipeHtml + "<p class='sharedLabel'>private</p>";
				}
				recipeHtml = recipeHtml + "</td>";
				recipeHtml = recipeHtml + "<td class='menuListItem' style='" + ratingStyle + ";'>" + ratingText + "</td>";
				recipeHtml = recipeHtml + "<td class='menuListItem' style='" + userRatingStyle + ";'>" + userRatingText + "</td>";
				recipeHtml = recipeHtml + "<td class='menuListItem' style='" + categoryStyle + ";'>" + categoryText + "</td>";
				recipeHtml = recipeHtml + "<td class='menuListItem' style='" + nationalityStyle + ";'>" + nationalityText + "</td>";
				recipeHtml = recipeHtml + "<td class='menuListItem recipeLink'>";
				recipeHtml = recipeHtml + "<a href='/show_recipe/" + nextId + "'>" + nextTitle;
				recipeHtml = recipeHtml + "</td>";
				recipeHtml = recipeHtml + "<td class='menuListItem selectItem'>";
				recipeHtml = recipeHtml + "<input type='checkbox' name='selectRecipe' id='selectRecipe_" + nextId + "' />";
				recipeHtml = recipeHtml + "</td>";
				recipeHtml = recipeHtml + "</tr>";
			}

			recipeHtml = recipeHtml + "</tbody></table>";

		// == no records found
		} else {
			recipeHtml = "<p class='info'> Sorry... no results were returned from the database.</p>";
		}

		// == complete new html and add to output element
		recipeHtml = recipeHtml + "</div>";
		$('#output').html(recipeHtml);

		// == enable selected recipe item functionality
		activateSelectItem();
	}

	// ======= makeTitleText =======
	function makeTitleText(jsonData, type) {
		console.log("== makeTitleText ==");

		var titleText;
		var ratingText = "";
		var ratingObj = jsonData.ratingObj;

		// ratingObj: 1=>{:id=>1, :rating=>[1, "favorite"], :color=>"#03045e"}, 2=>{}, etc.
		// jsonData.search for "text" type: [title OR ingredients, string to search for] e.g. ["title", "garlic"]

		if (jsonData != "") {
			if ((type == "text") && (jsonData.search[0] == "title")) {
				titleText = jsonData.search[1] + " in title";
			} else if ((type == "text") && (jsonData.search[0] == "ingredients")) {
				titleText = jsonData.search[1] + " in ingredients";
			} else if (type == "category") {
				titleText =  jsonData.search + " recipes";
			} else if (type == "nationality") {
				titleText = jsonData.search + " recipes";
			} else if (type == "rating") {
				// ratingText = ratingText + ratingObj[jsonData.search].rating[0];
				// ratingText = ratingText + ": ";
				ratingText = ratingText + ratingObj[jsonData.search].rating[1];
				titleText = ratingText + " recipes";
			} else if (type == "my") {
				titleText = "My Database Recipes";
			} else if (type == "all") {
				titleText = "All Shared Database Recipes";
			}
		} else {
			titleText = "Please enter a search value";
			$('#output').html("");
		}
		$('#outputTitle').text(titleText);
	}

	// ======= activateListHeaders =======
	function activateListHeaders() {
		console.log("== activateListHeaders ==");
		$('#ratingHeader').click(function() {
			console.log("== click: ratingHeader ==");
			sortRecipeList(1, 'text');
		});
		$('#userRatingHeader').click(function() {
			console.log("== click: userRatingHeader ==");
			sortRecipeList(2, 'text');
		});
		$('#categoryHeader').click(function() {
			console.log("== click: categoryHeader ==");
			sortRecipeList(3, 'text');
		});
		$('#nationalityHeader').click(function() {
			console.log("== click: nationalityHeader ==");
			sortRecipeList(4, 'text');
		});
		$('#titleHeader').click(function() {
			console.log("== click: titleHeader ==");
			sortRecipeList(5, 'text');
		});
	}

	// ======= sortRecipeList =======
	function sortRecipeList(columnIndex, columnType) {
		console.log("== sortRecipeList ==");

		// == get and set order (ascending or descending)
		var order = $('.menuList thead tr>th:eq(' + columnIndex + ')').data('order');
		order = order === 'ASC' ? 'DESC' : 'ASC';
		$('.menuList thead tr>th:eq(' + columnIndex + ')').data('order', order);

		// == table sort
		$('.menuList tbody tr').sort(function(a, b) {

			// == get text value in <td> via columnIndex number
			a = $(a).find('td:eq(' + columnIndex + ')').text();
			b = $(b).find('td:eq(' + columnIndex + ')').text();

			switch (columnType) {
				case 'text':
					return order === 'ASC' ? a.localeCompare(b) : b.localeCompare(a);
					break;
				case 'number':
					return order === 'ASC' ? a - b : b - a;
					break;
				case 'date':
					var dateFormat = function(dt) {
						[m, d, y] = dt.split('/');
						return [y, m - 1, d];
					}
					// == convert date string to an object
					a = new Date(...dateFormat(a));
					b = new Date(...dateFormat(b));
					// == convert the date object to numbers via getTime()
					return order === 'ASC' ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
					break;
			}
		}).appendTo('.menuList tbody');
	}

	// ======= activateSelectItem =======
    function activateSelectItem() {
		console.log("== activateSelectItem ==");

		$('.selectItem > input').change(function(e) {
			console.log("== selectItem: change ==");

			// == show export option in user menu
			if ($('.selectItem input:checkbox:checked').length > 0) {
				$('#exportLink').css('display', 'block');
				$('#exportLink').addClass('active');
				$('#exportLink').off('click', collectSelectedRecipes);
				$('#exportLink').on('click', collectSelectedRecipes);
			}
		});
	};

	// ======= collectSelectedRecipes =======
	function collectSelectedRecipes(e) {
		console.log("== collectSelectedRecipes ==");
		e.preventDefault();

		var nextRecipe, nextRecipeId;
		var selectedRecipeArray = [];

		for (var i = 0; i < $('.selectItem input:checkbox:checked').length; i++) {
			nextRecipe = $('.selectItem input:checkbox:checked')[i];
			nextRecipeId = $(nextRecipe).attr('id').split('_')[1];
			console.log("nextRecipeId: ", nextRecipeId);
			selectedRecipeArray.push(nextRecipeId);
		}
		exportSelectedRecipes(selectedRecipeArray);
		e.stopPropagation();
	};

	// ======= exportSelectedRecipes =======
    function exportSelectedRecipes(selectedRecipeArray) {
		console.log("== exportSelectedRecipes ==");

		var url = "/search_selected";
		var jsonData = JSON.stringify(selectedRecipeArray);

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
			displayImportedRecipes(jsonData.recipeArray, "export");
			activateFileSave(jsonData.recipeArray, "export");
		}).fail(function(unknown){
			console.log("*** ajax fail ***");
			console.log("unknown:", unknown);
		});

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

			var recipeObj = {title:titleString, ingredients:[], instructions:[]};
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


			// ======= read text file =======
			// ======= read text file =======
			// ======= read text file =======

			function importRecipeData(fileText) {
				console.log("== importRecipeData ==");

				// == initialize duration flag (for instruction lines with timing data)
				var isDur = false;
				var lineCount = (fileText.split("\n")).length;


				// ======= ======= ======= read file loop ======= ======= =======
				// ======= ======= ======= read file loop ======= ======= =======
				// ======= ======= ======= read file loop ======= ======= =======


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

						// ======= ======= ======= make recipeObj ======= ======= =======
						// ======= ======= ======= make recipeObj ======= ======= =======
						// ======= ======= ======= make recipeObj ======= ======= =======

						// == first recipe special case
						if (ingredientsArray.length == 0) {

							// == first element of instructionsArray is first recipe title; remove it
							instructionsArray.shift();

							// == backwards search findTitleArray for title line
							titleString = getRecipeTitle(findTitleArray);

							// == init recipeObj and findTitleArray for next recipe
							recipeObj = {title:titleString, ingredients:[], instructions:[]};
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
							recipeObj = {title:titleString, ingredients:[], instructions:[]};
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
				var recipeArray = importRecipeData(fileText);
				displayImportedRecipes(recipeArray, "import");
				activateFileSave(recipeArray, "import");
			}
			fr.readAsText(this.files[0]);
		})
	}

	// ======= displayImportedRecipes =======
    function displayImportedRecipes(recipeArray, importOrExport) {
        console.log("== displayImportedRecipes ==");
		console.log("recipeArray: ", recipeArray);
		console.log("importOrExport: ", importOrExport);

		var nextRecipe, nextTitle, nextIngredients, nextInstructions;
		var nextQuantity, nextUnits, nextIngredient, nextText, nextHtml;
		var nextInstruction, nextDuration, nextDurUnits;

		var recipeHtml = "";
		var recipeText = "";

		for (var i = 0; i < recipeArray.length; i++) {
			nextRecipe = recipeArray[i];
			nextTitle = recipeArray[i].title;
			nextIngredients = recipeArray[i].ingredients;
			nextInstructions = recipeArray[i].instructions;

			// == recipe title
			recipeHtml = recipeHtml + "<div class='recipeBox1'>";
			recipeHtml = recipeHtml + "<p class='recipeTitle'>" + nextTitle + "</p>";
			recipeText = recipeText + nextTitle + "\n\n";

			if (i === 0) {
				recipeHtml = recipeHtml + "<div class='saveBtn' id='fileSaveBtn'> Save </div>";
			}
			recipeHtml = recipeHtml + "</div>";

			// == ingredients label
			recipeHtml = recipeHtml + "<div class='newRecipeBox'>";
			recipeHtml = recipeHtml + "<p class='newRecipeLabel'>ingredients</p>";
			recipeText = recipeText + "ingredients\n";

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
				recipeText = recipeText + nextText + "\n";
			}

			recipeHtml = recipeHtml + "<p class='newRecipeLabel'>instructions</p>";
			recipeText = recipeText + "\n\n";
			recipeText = recipeText + "instructions\n";

			// instructionObj = {instruction:___, duration:___, durUnits:___};
			for (var k = 0; k < nextInstructions.length; k++) {
				nextInstruction = nextInstructions[k].instruction;
				nextDuration = nextInstructions[k].duration;
				nextDurUnits = nextInstructions[k].durUnits;
				nextHtml = "<p class='newInstruction'>" + nextInstruction + "</p>";
				recipeHtml = recipeHtml + nextHtml;
				recipeText = recipeText + nextInstruction + "\n";
			}
			recipeHtml = recipeHtml + "</div>"
			recipeText = recipeText + "\n\n\n";
		}

		$('#output').html(recipeHtml);

		// == create textarea as source for select/copy function when exporting recipe to text file
		var copyTextHtml = "<textarea id='textForCopy' rows='10' cols='500'>" + recipeText + "</textArea>";
		$('#output').append(copyTextHtml);

		// == recipes were imported from text file
		if (importOrExport === "import") {
			$('#inputfile').remove();
			updateTitleText("Imported Recipes");
			var messageString = "Click Save to import your recipe(s). You can edit them later via 'My Recipes'."

		// == selected recipes were returned from the database
		} else if (importOrExport === "export") {
			var messageString = "Click Save to save a text copy to your computer's clipboard."
		}

		// == tell the user what happened
		$('#notice').html(messageString);
	}

	// ======= activateFileSave =======
    function activateFileSave(recipeArray, importOrExport) {
        console.log("== activateFileSave ==");

		if (importOrExport === "import") {
			$('#fileSaveBtn').click(function(e) {
				console.log("== click: fileSaveBtn ==");
				e.preventDefault();
				saveRecipeData(recipeArray, "import");
				e.stopPropagation();
			});

		} else if (importOrExport === "export") {
			$('#fileSaveBtn').click(function(e) {
				console.log("== click: fileSaveBtn ==");
				e.preventDefault();

				var textForCopy = document.getElementById("textForCopy");
				var selection = document.getSelection();
			    var range = document.createRange();
			    range.selectNode(textForCopy);
			    selection.removeAllRanges();
			    selection.addRange(range);
				var copyStatus = document.execCommand("copy");
				console.log("copyStatus: ", copyStatus);
			    selection.removeAllRanges();

				var htmlString = "Your selected recipes have been copied. You can now paste them into a new text file."
				$('#notice').html(htmlString);

				e.stopPropagation();
			});
		}
	}

	// ======= copyRecipeData =======
	function copyRecipeData() {
		console.log("== copyRecipeData ==");

	    var copyText = document.getElementById("textForCopy");
	    copyText.select();
		console.log("copyText.value: ", copyText.value);
	    var copyStatus = document.execCommand("copy");
		console.log("copyStatus: ", copyStatus);
		var htmlString = "Your selected recipes have been copied. You can now paste them into a new text file."
		$('#notice').html(htmlString);
	}


	// ======= ======= ======= UTILITIES ======= ======= =======
	// ======= ======= ======= UTILITIES ======= ======= =======
	// ======= ======= ======= UTILITIES ======= ======= =======

	// ======= activateFileCancel =======
    function activateFileCancel() {
		console.log("== activateFileCancel ==");

		// == show my recipes
		$('#cancelImport').off('click');
		$('#cancelImport').click(function(e) {
			console.log("== click: cancelImport ==");
			window.location = "/";
		});
	}

	// ======= displayPopup =======
	function displayPopup(type, data) {
		console.log("== displayPopup ==");
		console.log("noShowFlag: ", noShowFlag);
		console.log("$('#showAgain:checked').length: ", $('#showAgain:checked').length);

		var popupHtml = "";

		if (type == "delete") {
			popupHtml = popupHtml + "<p>NOTE: This will destroy the classification for all recipes.</p>";
			popupHtml = popupHtml + "<p>Do this only for items misspelled or entered erroneously.</p>";
			popupHtml = popupHtml + "<p>Click <button class='popupDelete'>Delete</button>";
			popupHtml = popupHtml + " if you are sure you want to do this.</p>";
			popupHtml = popupHtml + "<p>Otherwise click Okay below.</p>";
		} else if (type == "mgmt") {
			popupHtml = popupHtml + "<p>Please enter a value.</p>";
		} else if (type == "search") {
			popupHtml = popupHtml + "<p>Please enter a search value.</p>";
		} else if (type == "noText") {
			popupHtml = popupHtml + "<p>Please enter new " + data + " text or click the <span>Cancel</span> button.</p>";
		} else if (type == "edit") {
			popupHtml = popupHtml + "<p>You haven't saved your edits yet.</p>";
			popupHtml = popupHtml + "<p>Click <span>Save</span> or <span>Cancel</span> before choosing another function.</p>";
		} else if (type == "newLine") {
			popupHtml = popupHtml + "<p>Your new " + data + " is at the bottom of the list.</p>";
			popupHtml = popupHtml + "<p>Drag it to its proper place in the sequence,</p>";
			popupHtml = popupHtml + "<p>then click <span>Save</span> or <span>Cancel</span>.</p>";
			if ($('#showAgain:checked').length > 0) {
				noShowFlag = true;
			}
		}

		if (!noShowFlag) {
			$('#popup-message').html(popupHtml);
			$('.popup-overlay, .popup-content').addClass('active');

			$('.popupDelete').off('click');
			$('.popupDelete').on('click', function(){
				console.log("== popup: delete ==");
				console.log("data: ", data);
				console.log("pathname: ", pathname);
				$('#popup-message').html('');
				$('.popup-overlay, .popup-content').removeClass('active');
			});

		}
	}

	$('#showAgain').change(function(e){
		console.log("== #showAgain: change ==");
		console.log("noShowFlag: ", noShowFlag);
		console.log("$('#showAgain:checked').length: ", $('#showAgain:checked').length);
		if ($('#showAgain:checked').length > 0) {
			noShowFlag = true;
		}
		console.log("noShowFlag: ", noShowFlag);
	});

	$('.close').off('click');
	$('.close').on('click', function(){
		console.log('== popup: close ==');
		$('#popup-message').html('');
		$('.popup-overlay, .popup-content').removeClass('active');
	});

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
			$('#sharedLabel').hide();
			$('#shared').hide();
		} else {
			$('#rating_edit_select').show();
			$('#category_edit_select').show();
			$('#nationality_edit_select').show();
			$('#cancelRecipeEdits').show();
			$('#saveRecipeEdits').show();
			$('#deleteRecipe').show();
			$('#sharedLabel').show();
			$('#shared').show();
		}
	}

	// ======= deactivateTitleEdit =======
	function deactivateTitleEdit() {
		console.log("== deactivateTitleEdit ==");
		$('#outputTitle').off('mouseover');
		$('#outputTitle').off('mouseout');
		$('#outputTitle').off('click');
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


	// ======= ======= ======= CLASSIFY (ratings, categories, nationalities) ======= ======= =======
	// ======= ======= ======= CLASSIFY (ratings, categories, nationalities) ======= ======= =======
	// ======= ======= ======= CLASSIFY (ratings, categories, nationalities) ======= ======= =======

	// ======= activateClassifyActions =======
    function activateClassifyActions() {
		console.log("== activateClassifyActions ==");

		$('#newClassifyBtn').off('click');
		$('#newClassifyBtn').click(function(e) {
			console.log("== click: newClassifyBtn ==");
			e.preventDefault();
			makeNewClassify();
			e.stopPropagation();
		});
		$('.editClassifyBtn').off('click');
		$('.editClassifyBtn').click(function(e) {
			console.log("== click: editClassifyBtn ==");
			e.preventDefault();
			var itemId = $(this).attr('id').split('_')[1];
			editClassifyText(itemId);
			e.stopPropagation();
		});
	}

	// ======= makeNewClassify =======
	function makeNewClassify() {
		console.log("== makeNewClassify ==");

		var inputHtml = "<input type='text' id='newClassify' name='newClassify' class='newClassify'>";
		var btnsHtml = "<div class='saveBtn'> save </div>";
		btnsHtml = btnsHtml + "<div class='cancelBtn'> cancel </div> ";
		var editHtml = inputHtml + btnsHtml;
		$('#newClassifyBtn').replaceWith(editHtml);

		$('.saveBtn').click(function(e) {
			e.preventDefault();
			saveNewClassify();
			e.stopPropagation();
		});
		$('.cancelBtn').click(function(e) {
			e.preventDefault();
			cancelNewClassify();
			e.stopPropagation();
		});
	}

	// ======= saveNewClassify =======
	function saveNewClassify() {
		console.log("== saveNewClassify ==");

		if (pathParts[1] == "ratings") {
			var url = "/new_rating";
		} else if (pathParts[1] == "categories") {
			var url = "/new_category";
		} else if (pathParts[1] == "nationalities") {
			var url = "/new_nationality";
		}

		var newText = $('#newClassify').val();
		console.log("url: ", url);
		console.log("newText: ", newText);

		if (newText != "") {
			var jsonData = JSON.stringify({new_classify:newText});
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
				cancelNewClassify();
				location.reload();
			}).fail(function(unknown){
				console.log("*** ajax fail ***");
				console.log("unknown:", unknown);
			});
		} else {
			displayPopup("mgmt", "");
		}
	}

	// ======= cancelNewClassify =======
	function cancelNewClassify() {
		console.log("== cancelNewClassify ==");

		if (pathParts[1] == "ratings") {
			var btnText = "New Rating";
		} else if (pathParts[1] == "categories") {
			var btnText = "New Category";
		} else if (pathParts[1] == "nationalities") {
			var btnText = "New Nationality";
		}

		$('#newClassify, .saveBtn, .cancelBtn').remove();
		var saveHtml = "<a id='newClassifyBtn' href=''>" + btnText + "</a>";
		$('.btnRow > .dataColumn').append(saveHtml);
		activateClassifyActions();
	}

	// ======= editClassifyText =======
	function editClassifyText(itemId) {
		console.log("== editClassifyText ==");
		console.log("itemId: ", itemId);

		var currentText = $('#classify_' + itemId).text();
		console.log("currentText: ", currentText);

		var inputHtml = "<input type='text' id='editClassify_" + itemId + "' class='editItemText' value='" + currentText + "' >";
		var btnsHtml = "<div id='saveItem_" + itemId + "' class='saveBtn'> save </div>";
		btnsHtml = btnsHtml + "<div id='cancelItem_" + itemId + "' class='cancelBtn'> cancel </div> ";
		var editHtml = inputHtml + btnsHtml;
		$("td[id='classify_" + itemId + "']").html(editHtml);

		$('.saveBtn').click(function(e) {
			e.preventDefault();
			var itemId = $(this).first().attr('id').split("_")[1];
			var newText = $('#editClassify_' + itemId).val();
			saveEditClassify(itemId, newText);
			e.stopPropagation();
		});
		$('.cancelBtn').click(function(e) {
			e.preventDefault();
			var itemId = $(this).first().attr('id').split("_")[1];
			cancelEditClassify(itemId, currentText);
			e.stopPropagation();
		});
	}

	// ======= saveEditClassify =======
	function saveEditClassify(itemId, newText) {
		console.log("== saveEditClassify ==");
		console.log("itemId: ", itemId);
		console.log("newText: ", newText);

		if (pathParts[1] == "ratings") {
			var url = "/update_rating";
			var jsonData = JSON.stringify({item_id:itemId, rating:newText});
		} else if (pathParts[1] == "categories") {
			var url = "/update_category";
			var jsonData = JSON.stringify({item_id:itemId, category:newText});
		} else if (pathParts[1] == "nationalities") {
			var url = "/update_nationality";
			var jsonData = JSON.stringify({item_id:itemId, nationality:newText});
		}

		var newText = $('#editClassify_' + itemId).val();
		console.log("newText: ", newText);

		if (newText != "") {
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
				cancelEditClassify(itemId, newText);
				location.reload();
			}).fail(function(unknown){
				console.log("*** ajax fail ***");
				console.log("unknown:", unknown);
			});
		} else {
			displayPopup("mgmt", "");
		}
	}

	function cancelEditClassify(itemId, currentText) {
		console.log("== cancelEditClassify ==");
		console.log("itemId:", itemId);
		console.log("currentText:", currentText);

		$('#editClassify_' + itemId + ', .saveBtn, .cancelBtn').remove();
		$("td[id='classify_" + itemId + "']").html(currentText);

	}

});
