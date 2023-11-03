$(document).ready(() => {
	$.get("/api/posts", { followingOnly: true }, results => {
		outputPosts(results, $(".postsContainer"));
	});
	$("#homeButtonIcon").removeClass("far").addClass("fas");
})
