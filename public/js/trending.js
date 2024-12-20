// Code to be ran when the document is ready
$(document).ready(() => {
    // Send a get request to the /api/posts route, specifying that it is the trending page
	$.get("/api/posts", { trendingPage: true }, results => {
        // Output the posts to the postsContainer container
		outputPosts(results, $(".postsContainer"));
	});
    // Remove the far class from the home button icon and add the fas class
	$("#homeButtonIcon").removeClass("far").addClass("fas");
})
