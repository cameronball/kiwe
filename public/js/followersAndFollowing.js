$(document).ready(() => {

	if(selectedTab == "followers") {
		loadFollowers();
	}
	else {
		LoadFollowing();
	}
})

function loadFollowers() {
	$.get(`api/users/${profileUserId}/followers`, results => {
		outputPosts(results, $(".resultsContainer"));
	});
}

function LoadFollowing() {
	$.get(`api/users/${profileUserId}/following`, results => {
		outputPosts(results, $(".resultsContainer"));
	});
}

function outputUsers(data, container) {
	console.log(data)
}