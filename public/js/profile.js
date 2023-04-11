$(document).ready(() => {

	if(selectedTab == "replies") {
		loadPosts(true);
	}
	else {
		loadPosts(false);
	}
})

function loadPosts(replyBool) {
	$.get("/api/posts", { postedBy: profileUserId, isReply: replyBool }, results => {
		outputPosts(results, $(".postsContainer"));
	});
}