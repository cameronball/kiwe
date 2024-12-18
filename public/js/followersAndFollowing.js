// On page load
$(document).ready(() => {
	// Make profile page icon filled in
	$("#profileButtonIcon").removeClass("far").addClass("fas");

	// If on followers tab
	if(selectedTab == "followers") {
		// Load folowers list
		loadFollowers();
	}
	else {
		// Else load following list
		LoadFollowing();
	}
})

// Function to load the followers list
function loadFollowers() {
	// Issue a get request with the target user id
	$.get(`/api/users/${profileUserId}/followers`, results => {
		// Output the results
		outputUsers(results.followers, $(".resultsContainer"));
	});
}

// Function to load the following list
function LoadFollowing() {
	// Issue a get request with the target user id
	$.get(`/api/users/${profileUserId}/following`, results => {
		// Output the results
		outputUsers(results.following, $(".resultsContainer"));
	});
}
