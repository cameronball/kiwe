$(document).ready(() => {

	loadPosts(selectedTab)

	$("#profileButtonIcon").removeClass("far").addClass("fas");
})

function loadPosts(type) {
	if (type == "likes") {
		$.get("/api/posts", { postedBy: profileUserId, isReply: false, pinned: false, isLikes: true }, results => {
			outputPosts(results, $(".postsContainer"));
		});
	}
	else if (type == "replies") {
		$.get("/api/posts", { postedBy: profileUserId, isReply: true, pinned: true}, results => {
			outputPinnedPost(results, $(".pinnedPostContainer"));
		});

		$.get("/api/posts", { postedBy: profileUserId, isReply: true, pinned: false}, results => {
			outputPosts(results, $(".postsContainer"));
		});
	}
	else {
		$.get("/api/posts", { postedBy: profileUserId, isReply: false, pinned: true }, results => {
			outputPinnedPost(results, $(".pinnedPostContainer"));
		});

		$.get("/api/posts", { postedBy: profileUserId, isReply: false, pinned: false }, results => {
			outputPosts(results, $(".postsContainer"));
		});
	}
}

function outputPinnedPost(results, container) {
	if (results.length == 0) {
		container.hide();
		return;
	}
	
	container.html("");

	results.forEach(result => {
		var html = createPostHtml(result);
		container.append(html);
	});
}
