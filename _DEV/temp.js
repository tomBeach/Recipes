
// ======= enable drag-n-drop =======
$('#ingredients').sortable({
	start: function (event, ui) {
		console.log("== start ==");
		console.log("ui: ", ui);
		console.log("$(ui.item).attr('id'): ", $(ui.item).attr('id'));
		var itemId = $(ui.item).attr('id');
		console.log("itemId: ", itemId);
		$(ui.item).data("startindex", ui.item.index());
		$(ui.item).data('itemId', itemId);
	},
	stop: function (event, ui) {
		console.log("== stop ==");
		self.updateIngredientSeq(ui.item);
	}
}).disableSelection();

$('#instructions').sortable({
	start: function (event, ui) {
		console.log("== start ==");
		$(ui.item).data("startindex", ui.item.index());
		$(ui.item).data("test", "testValue");
	},
	stop: function (event, ui) {
		console.log("== stop ==");
		self.updateInstructionsSeq(ui.item);
	}
}).disableSelection();

// ======= init unedited sort order =======
var ingredientsInOrder = $("#ingredients").sortable("toArray");		// ingredient element ids
var instructionsInOrder = $("#instructions").sortable("toArray");	// instruction element ids

// ======= updateIngredientSeq =======
self.updateIngredientSeq = function($item) {
	console.log("== updateIngredientSeq ==");
	$('#saveRecipeEdits').addClass('active');						// ingredient moved: enable save button
	$('#cancelRecipeEdits').addClass('active');						// ingredient moved: enable cancel button
	editFlag = true;
	var startIndex = $item.data("startindex") + 1;
	var newIndex = $item.index() + 1;
	if (newIndex != startIndex) {
		var itemIndexData = { id: $item.attr("id"), oldPosition: startIndex, newPosition: newIndex };
		ingredientsInOrder = $("#ingredients").sortable("toArray");
		console.log("ingredientsInOrder: ", ingredientsInOrder);
	}
}

// ======= updateInstructionsSeq =======
self.updateInstructionsSeq = function($item) {
	console.log("== updateInstructionsSeq ==");
	$('#saveRecipeEdits').addClass('active');						// instruction moved: enable save button
	$('#cancelRecipeEdits').addClass('active');						// instruction moved: enable save button
	editFlag = true;
	var startIndex = $item.data("startindex") + 1;
	var newIndex = $item.index() + 1;
	if (newIndex != startIndex) {
		var itemIndexData = { id: $item.attr("id"), oldPosition: startIndex, newPosition: newIndex };
		instructionsInOrder = $("#instructions").sortable("toArray");
		console.log("instructionsInOrder: ", instructionsInOrder);
	}
}


// ======= saveNewLine =======
function saveNewLine() {
	console.log("== saveNewLine ==");

	// == activate save and cancel buttons
	editFlag = true;
	$('#saveRecipeEdits').addClass('active');
	$('#cancelRecipeEdits').addClass('active');

	// == create save and cancel buttons for ingredients or instructions
	var updateHtml = "";
	var ingrOrInst = $(this).attr('id');
	console.log("ingrOrInst: ", ingrOrInst);

	// == save new ingedient line
	if (ingrOrInst == "ingrSave") {
		var ingredientsData = $('#ingredientsData').data().ingredients;
		var newSequence = ingredientsData.length + 1;
		var newText = $('#newIngr').val();
		var newId = newSequence;			// no database id yet; sequence number used as temp id
		var newIngredient = {id: newId, recipe_id: 152, ingredient: newText, sequence: newSequence, created_at: null, updated_at: null};
		ingredientsData.push(newIngredient);

		updateHtml = updateHtml + "<div class='recipeLine ui-sortable-handle' id='newIngrLine_" + newSequence +  "'>";
		updateHtml = updateHtml + "<div id='ingrSeq_' class='sequence'>" + newSequence +  "</div>";
		updateHtml = updateHtml + "<p class='ingredient' id='ingredient_'>" + newText + "</p>";
		updateHtml = updateHtml + "</div>";
		$('#ingredients').append(updateHtml);
		$('#ingredient_').on('mouseover', hiliteLink);
		$('#ingredient_').on('mouseout', restoreLink);
		$('#ingredient_').on('click', editRecipeLine);

	// == save new instruction line
	} else {
		var instructionsData = $('#instructionsData').data().instructions;
		var newSequence = instructionsData.length + 1;
		var newText = $('#newInst').val();
		var newId = newSequence;			// no database id yet; sequence number used as temp id
		var newInstruction = {id: newId, recipe_id: 152, instruction: newText, sequence: newSequence, created_at: null, updated_at: null};
		instructionsData.push(newInstruction);

		updateHtml = updateHtml + "<div class='recipeLine ui-sortable-handle' id='newInstLine_" + newSequence +  "'>";
		updateHtml = updateHtml + "<div id='instSeq_' class='sequence'>" + newSequence + "</div>";
		updateHtml = updateHtml + "<p class='instruction' id='instruction_'>" + newText + "</p>";
		updateHtml = updateHtml + "</div>";
		$('#instructions').append(updateHtml);
		$('#instruction_').on('mouseover', hiliteLink);
		$('#instruction_').on('mouseout', restoreLink);
		$('#instruction_').on('click', editRecipeLine);
	}

	console.log("ingredientsData: ", ingredientsData);
	console.log("instructionsData: ", instructionsData);

	// == remove previously existing buttons if any
	$('.newRecipeLine').remove();
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
	var ingredientsData = $('#ingredientsData').data().ingredients;
	var instructionsData = $('#instructionsData').data().instructions;

	// == update sequence values to capture sort changes
	for (var i = 0; i < ingredientsInOrder.length; i++) {
		nextItem = ingredientsInOrder[i];
		nextItemId = nextItem.split("_")[1];			// id format: "ingrLine_XXXX" (XXXX = database id or sequence number)
		console.log("nextItem: ", nextItem);
		console.log("nextItemId: ", nextItemId);
		for (var j = 0; j < ingredientsData.length; j++) {
			nextIngredientId = ingredientsData[j].id;
			if (nextItemId == nextIngredientId) {
				ingredientsData[j].sequence = i + 1;
			}
		}
	}
	console.log("ingredientsData: ", ingredientsData);

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

	// == avoid null values (when items not set by user)
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
		instructions:instructionsData};

	saveRecipeData(recipeData, "edit");
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
		console.dir(jsonData);
		var updatedRecipe = JSON.parse(jsonData.updated_recipe);
		console.log("updatedRecipe:", updatedRecipe);
		if (importEdit == "import") {
			updateImportLink("import recipes");
		}
		updateNoticeMessage(jsonData);
		updateSequenceDisplay();
	}).fail(function(unknown){
		console.log("*** ajax fail ***");
		console.log("unknown:", unknown);
	});
}

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
