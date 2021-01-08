$(document).ready(function() {
    console.log("== jQuery loaded ==");

	function testClick() {
		console.log("== click: firstName ==");
	};

	$('#clickTest').on('click', testClick);

	function sortTable(columnIndex, columnType) {
		console.log("== sortTable ==");
		console.log("columnIndex: ", columnIndex);
		console.log("columnType: ", columnType);

		// == get and set order (ascending or descending)
		var order = $('.table thead tr>th:eq(' + columnIndex + ')').data('order');
		order = order === 'ASC' ? 'DESC' : 'ASC';
		$('.table thead tr>th:eq(' + columnIndex + ')').data('order', order);
		console.log("order2: ", order);

		// == table sort
		$('.table tbody tr').sort(function(a, b) {
			console.log("== <tr> sort ==");
	  		// console.log("a: ", a);
	  		// console.log("b: ", b);

		    // == get text value in <td> via columnIndex number
		    a = $(a).find('td:eq(' + columnIndex + ')').text();
		    b = $(b).find('td:eq(' + columnIndex + ')').text();

		    switch (columnType) {
				case 'text':
					// == compare text via localeCompare
					return order === 'ASC' ? a.localeCompare(b) : b.localeCompare(a);
					break;
				case 'number':
					// == compare number values
					return order === 'ASC' ? a - b : b - a;
					break;
				case 'date':
					// == compare date values
					var dateFormat = function(dt) {
						[m, d, y] = dt.split('/');
						return [y, m - 1, d];
					}
					// == convert date string to an object
					a = new Date(...dateFormat(a));
					b = new Date(...dateFormat(b));
					// == convert the date object to numbers via getTime() (milliseconds since January 1, 1970)
					return order === 'ASC' ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
					break;
		    }
		}).appendTo('.table tbody');
	}

	$('#firstName').click(function() {
		console.log("== click: firstName ==");
		sortTable(1, 'text');
	});
	$('#age').click(function() {
		console.log("== click: age ==");
		sortTable(2, 'number');
	});
	$('#date').click(function() {
		console.log("== click: date ==");
		sortTable(3, 'date');
	});

});
