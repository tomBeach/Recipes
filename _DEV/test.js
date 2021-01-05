var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */

$(document).ready(function() {
    console.log("== jQuery loaded ==");

	function activateMenu() {
		console.log("== activateMenu ==");

		$('#profile > div > a:nth-of-type(1)').on('click', importNewRecipe);
		$('#profile > div > a:nth-of-type(2)').on('click', editRatings);
		var whichColumn = 'share';

		$('#shareHeader').on('click', sortOnColumn);
		$('#ratingHeader').on('click', sortOnColumn);
		$('#categoryHeader').on('click', sortOnColumn);
		$('#nationalityHeader').on('click', sortOnColumn);
		$('#titleHeader').on('click', sortOnColumn);
	}
	function sortOnColumn() {
		console.log("== sortOnColumn ==");
	}
	function importNewRecipe() {
		console.log("== importNewRecipe ==");
	}
	function editRatings() {
		console.log("== editRatings ==");
	}
	activateMenu();



	// == Sort a list of elements and apply the order to the DOM.
	// source: https://gist.github.com/mindplay-dk/6825439

	// $.fn.order = function(asc, fn) {
	//     fn = fn || function (el) {
	//         return $(el).text().replace(/^\s+|\s+$/g, '');
	//     };
	//     var T = asc !== false ? 1 : -1,
	//         F = asc !== false ? -1 : 1;
	//     this.sort(function (a, b) {
	//         a = fn(a), b = fn(b);
	//         if (a == b) return 0;
	//         return a < b ? F : T;
	//     });
	//     this.each(function (i) {
	//         this.parentNode.appendChild(this);
	//     });
	// };
	//
	// // alphabetical list sort, ascending: (default)
	// $('ul li').order();
	//
	// // sort table rows by descending value in first column:
	// $('table tr').order(false, function (el) {
	//     return parseInt($('td', el).text());
	// });





});
