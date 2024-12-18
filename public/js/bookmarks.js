// Code to be ran when the page has loaded
$(document).ready(() => {
	// Issue a get request for all posts bookmarked by the current user
	$.get("/api/posts", { bookmarksOnly: true }, results => {
		// Output the results to the postsContainer
		outputPosts(results, $(".postsContainer"));
	});
	// Set the bookmarks icon in the navbar to be solid
	$("#bookmarkButtonIcon").removeClass("far").addClass("fas");
})
