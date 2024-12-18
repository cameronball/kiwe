// If there is a key pressed in the search box element
$("#searchBox").keydown(function(event) {
	// Clear the timeout on the timer object
	clearTimeout(timer);
	// Get the textbox
	var textbox = $(event.target);
	// Get the value of the textbox
	var value = textbox.val();
	// Get the type of search
	var searchType = textbox.data().search;

	// Create a timer, so less requests are sent if the user is typing fast
	timer = setTimeout(() => {
		// Set the value to contents of the textbox
		value = textbox.val().trim();
		// If empty
		if (value == "") {
			// Remove results
			$(".resultsContainer").html("");
			// Halt execution
			return;
		}
		else {
			// Search using the value and type
			search(value, searchType);
		}
	}, 0.1);
})

// Function to search
function search(searchTerm, searchType) {
	// Determine whether to search posts or users
	var url = searchType == "users" ? "/api/users" : "/api/posts";
	// Send the get request wih type and term
	$.get(url, {search: searchTerm}, results => {
		
		// If users, output users
		if(searchType == "users") {
			outputUsers(results, $(".resultsContainer"));
		}
		// If posts, output posts
		else {
			outputPosts(results, $(".resultsContainer"));
		}

	})
}

// On load
$(document).ready(() => {
	// Make the search button icon solid
	$("#searchButtonIcon").removeClass("far").addClass("fas");

	// Check if data-term is set on the search box
	var value = $("#searchBox").data().term;
	var searchType = $("#searchBox").data().search;
	if(value && value != "") {
		search(value, searchType);
	}
})
