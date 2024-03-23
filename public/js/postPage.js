$(document).ready(() => {
	$.get("/api/posts/" + postId, results => {
		outputPostsWithReplies(results, $(".postsContainer"));
	})
	.fail((xhr, status, error) => {
		if (xhr.status === 404) {
			$(".postsContainer").append("<span class='noResults'>This post is not found or is longer available</span>");
		}
	  });
	$("#homeButtonIcon").removeClass("far").addClass("fas");
})
