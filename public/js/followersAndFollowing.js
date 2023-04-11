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
		outputUsers(results, $(".resultsContainer"));
	});
}

function LoadFollowing() {
	$.get(`/api/users/${profileUserId}/following`, results => {
		outputUsers(results, $(".resultsContainer"));
	});
}

function outputUsers(data, container) {
	console.log(data)
}