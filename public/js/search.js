$("#searchBox").keydown(function(event) {
	clearTimeout(timer);
	var textbox = $(event.target);
	var value = textbox.val();
	var searchType = textbox.data().search;

	timer = setTimeout(() => {
		value = textbox.val().trim();
		if (value == "") {
			$(".resultsContainer").html("");
			return;
		}
		else {
			search(value, searchType);
		}
	}, 0.1);
})

function search(searchTerm, searchType) {
	var url = searchType == "users" ? "/api/users" : "/api/posts";
	$.get(url, {search: searchTerm}, results => {
		
		if(searchType == "users") {
			outputUsers(results, $(".resultsContainer"));
		}
		else {
			outputPosts(results, $(".resultsContainer"));
		}

	})
}

$(document).ready(() => {
	$("#searchButtonIcon").removeClass("far").addClass("fas");

	// Check if data-term is set on the search box
	var value = $("#searchBox").data().term;
	var searchType = $("#searchBox").data().search;
	if(value && value != "") {
		search(value, searchType);
	}
})
