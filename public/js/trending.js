$(document).ready(() => {
	$.get("/api/posts", { trendingPage: true }, results => {
		outputPosts(results, $(".postsContainer"));
	});
	$("#homeButtonIcon").removeClass("far").addClass("fas");
})
