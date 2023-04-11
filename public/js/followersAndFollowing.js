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

function outputUsers(results, container) {
	container.html("");
	
	results.forEach(result => {
		var html = createUserHtml(result, true);
		container.append(html);
	});

	if(results.length == 0) {
		container.append(`<center><br><h1>Nothing to see here :(</h1><br><a href='/profile/${profileUserId}' id='submitPostButton'>Back to profile</a></center>`);
	}
}

function createUserHtml(userData, showFollowButton) {
	return `<div class="user">
				<div class="userImageContainer">
					<img src="${userData.profilePic}">
				</div>
				<div class="userDetailsContainer">
					<div class="header">
						<a href='/profile/${userData.username}'>${userData.firstName} ${userData.lastName}</a>
						<span class="username">@${userData.username}</span>
					</div>
				</div>
			</div>`;
}