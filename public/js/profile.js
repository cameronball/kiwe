// On load
$(document).ready(() => {
	// If on replies tab
	if(selectedTab == "replies") {
		// Load replies
		loadPosts(true);
	}
	else {
		// Load posts
		loadPosts(false);
	}

	// Make the profile button icon solid
	$("#profileButtonIcon").removeClass("far").addClass("fas");
})

// Function to load posts, based on the reply boolean, it will issue two ajax requests for the pinned post as well as other posts
function loadPosts(replyBool) {
	if(!replyBool) {
		$.get("/api/posts", { postedBy: profileUserId, isReply: false, pinned: true }, results => {
			outputPinnedPost(results, $(".pinnedPostContainer"));
		});

		$.get("/api/posts", { postedBy: profileUserId, isReply: false, pinned: false }, results => {
			outputPosts(results, $(".postsContainer"));
		});
	}
	else {
		$.get("/api/posts", { postedBy: profileUserId, isReply: true, pinned: true}, results => {
			outputPinnedPost(results, $(".pinnedPostContainer"));
		});

		$.get("/api/posts", { postedBy: profileUserId, isReply: true, pinned: false}, results => {
			outputPosts(results, $(".postsContainer"));
		});
	}
}

// Function to output pinned post
function outputPinnedPost(results, container) {
	// If there are no pinned posts
	if (results.length == 0) {
		// Hide the pinned post container
		container.hide();
		// Halt execution
		return;
	}
	
	// Remove everything from the container
	container.html("");

	// For each result
	results.forEach(result => {
		// Create the html
		var html = createPostHtml(result);
		// Render the html
		container.append(html);
	});
}
