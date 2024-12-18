// On load
$(document).ready(() => {
	// Send a get request to the post api endpoint 
	$.get("/api/posts/" + postId, results => {
		// Output the post as well as any replies
		outputPostsWithReplies(results, $(".postsContainer"));
	})
	// On fail
	.fail((xhr, status, error) => {
		if (xhr.status === 404) {
			// Output an error code
			$(".postsContainer").append("<span class='noResults'>This post is not found or is longer available</span>");
		}
	  });
	// Make the home icon solid
	$("#homeButtonIcon").removeClass("far").addClass("fas");
})
