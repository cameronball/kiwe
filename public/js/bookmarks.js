$(document).ready(() => {
	$.get("/api/posts", { bookmarksOnly: true }, results => {
		outputPosts(results, $(".postsContainer"));
	});
	$("#bookmarkButtonIcon").removeClass("far").addClass("fas");
})
