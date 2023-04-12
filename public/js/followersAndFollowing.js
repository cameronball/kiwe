$(document).ready(() => {

	if(selectedTab == "followers") {
		loadFollowers();
	}
	else {
		LoadFollowing();
	}
})

function loadFollowers() {
	$.get(`/api/users/${profileUserId}/followers`, results => {
		outputUsers(results.followers, $(".resultsContainer"));
	});
}

function LoadFollowing() {
	$.get(`/api/users/${profileUserId}/following`, results => {
		outputUsers(results.following, $(".resultsContainer"));
	});
}