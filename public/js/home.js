// On page load
$(document).ready(() => {
	// Issue a get request to the posts api endpoint only for posts from users the current user followers
	$.get("/api/posts", { followingOnly: true }, results => {
		// Output the posts
		outputPosts(results, $(".postsContainer"));
	});
	// Make the home button icon solid
	$("#homeButtonIcon").removeClass("far").addClass("fas");
})
