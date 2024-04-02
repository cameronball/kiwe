$(document).ready(() => {
	$.get("/api/notifications", (data) => {
		outputNotificationsList(data, $(".resultsContainer"));		
	});
	$("#notificationButtonIcon").removeClass("far").addClass("fas");
});

$("#markNotificationsAsRead").click(() => markNotificationsAsOpened());

function outputNotificationsList(notifications, container,) {
	var increment = 0;
	for (const notification of notifications) {
		var html =  createNotificationHtml(notification, increment);
		container.append(html);
		increment++;
	}

	if (notifications.length == 0) {
		container.append("<span class='noResults'>No notifications? It's almost as if your phone is trying to tell you something.</span>");
	}
}

function getNotificationPostHtml(notification, increment) {
	$.get(`/api/posts/${notification.entityId}`, (post) => {
		postData = post.postData;
		var isReshare = postData.reshareData !== undefined;
		var resharedBy = isReshare ? postData.postedBy.username : null;
		postData = isReshare ? postData.reshareData : postData;

		var postedBy = postData.postedBy;

		if(postedBy._id === undefined) {
			return console.log("User object not populated");
		}

		if (postedBy.lastName == "") {
			var displayName = postedBy.firstName;
		}
		else {
			var displayName = postedBy.firstName + " " + postedBy.lastName;
		}
		var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

		var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
		var likeButtonFillIcon = postData.likes.includes(userLoggedIn._id) ? "fas" : "far";
		
		var reshareButtonActiveClass = postData.reshareUsers.includes(userLoggedIn._id) ? "active" : "";

		var verified = "";
		var verifiedBrand = postedBy.verifiedBrand ? `<svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1.5em;padding-left:0px;vertical-align: -0.45em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg>` : "";
		var squarePicture = postedBy.verifiedBrand ? `style="border-radius: 10%;"` : "";
		
		// Troll verified
		//var verified = postedBy.verified ? `<img style="height: 1em;padding-left:5px;vertical-align:-0.175em;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified"><i class="fa-solid fa-circle-check" style="color:hotpink;"></i><i style="margin-left:5px; color:salmon;" class="fa-solid fa-spell-check"></i><i class="fa-solid fa-calendar-check" style="margin-left:5px; color:#ff5555;"></i><i style="margin-left:5px;" class="fa-solid fa-user-ninja"></i><i style="margin-left:5px;color:#0000ff;" class="fa-solid fa-user-astronaut"></i><i style="margin-left:5px;" class="fa-solid fa-person-through-window"></i><i style="margin-left:5px;color:#eebb55;" class="fa-solid fa-radiation"></i><i style="margin-left:5px;color:#888888;" class="fa-solid fa-person-rifle"></i><i style="margin-left:5px;color:#5555ff;" class="fa-solid fa-person-drowning"></i><i style="margin-left:5px;" class="fa-solid fa-people-robbery"></i><i style="margin-left:5px;color:#22ff00;" class="fa-solid fa-magnifying-glass-dollar"></i><i style="margin-left:5px;" class="fa-solid fa-child-combatant"></i><i style="margin-left:5px;color:#ff0000;" class="fa-solid fa-biohazard"></i><i style="margin-left:5px;" class="fa-solid fa-chess-knight"></i>` : "";
		
		var admin = "";

		var verifiedGovernment = postedBy.verifiedGovernment ? `<i class="fas fa-circle-check" style="margin-left:5px;color:#696969;" data-toggle="tooltip" data-placement="top" title="Government Affiliated Account"></i>` : "";

		var reshareText = '';
		if(isReshare) {
			reshareText = `<span><i class='fas fa-repeat'></i>&nbsp;&nbsp;Reshared by <a>@${resharedBy}</a></span>`
		}
		
		var replyFlag = '';
		if(postData.replyTo && postData.replyTo._id) {
			
			if(!postData.replyTo._id) {
				return alert("Reply to is not populated");
			}
			else if(!postData.replyTo.postedBy._id) {
				return alert("Posted by is not populated");
			}

			var replyToUsername = postData.replyTo.postedBy.username;
			replyFlag = `<div class='replyFlag'>
							Replying to <a>@${replyToUsername}</a>
						</div>`
		}

		var buttons = "";
		var pinnedPostText = "";
		if (postData.postedBy._id == userLoggedIn._id) {
			if(postData.pinned === true) {
				buttons = `<button class="unpinButton" data-id="${postData._id}" data-toggle="modal" data-target="#unpinModal"><i class="fas fa-thumbtack"></i></button><button class="deleteButton" data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-trash"></i></button>`    
			}
			else {
				buttons = `<button class="pinButton" data-id="${postData._id}" data-toggle="modal" data-target="#confirmPinModal"><i class="fas fa-thumbtack"></i></button><button class="deleteButton" data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-trash"></i></button>`
			}
		}
		else if (userLoggedIn.admin) {
			buttons = `<button class="deleteButton" data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-trash"></i></button>`
		}

		if(postData.pinned === true) {
			pinnedPostText = `<span><i class="fas fa-thumbtack" style="color: rgb(101, 119, 134);"></i>&nbsp;&nbsp;Pinned<span>`
		}

		if(isReshare && postData.pinned) {
			temp = pinnedPostText;
			pinnedPostText = pinnedPostText + '&nbsp;&nbsp;<span>|</span>&nbsp;&nbsp;' + reshareText;
			reshareText = '';
		}

		var image = "";

		if(postData.image) {
			if(postData.content) {
				var image = `<div class='postImage'>
								<img style="width: auto;" src='${postData.image}'>
							</div>`;
			}
			else {
				var image = `<br><div class='postImage'>
								<img style="width: auto;" src='${postData.image}'>
							</div>`;
			}
		}

		var containerId = `#${increment}`;
		$(containerId).append(`<div class='post' style='border-bottom: 0px !important;' data-id='${postData._id}'>
													<div class='postActionContainer'>
														${pinnedPostText}
														${reshareText}
													</div>
													<div class='mainContentContainer'>
														<div class='userImageContainer'>
															<img ${squarePicture} src='${postedBy.profilePic}'>
														</div>
														<div class='postContentContainer'>
															<div class='header'>
																<span><a class='displayName'>${displayName}</a>${verifiedBrand}${verified}${admin}${verifiedGovernment}</span>
																<span class='username'>&nbsp;@${postedBy.username}</span>
																<span class='date'>&nbsp;&nbsp;•&nbsp;&nbsp;${timestamp}</span>
																<span class='datePlaceholder'></span>
															</div>
															${replyFlag}
															<div class='postBody'>
																<span>${postData.content}</span>
															</div>
															${image}
														</div>
													</div>
												</div>`);
	});
}

function createNotificationHtml(notification, increment) {
	var userFrom = notification.userFrom;
	var text = getNotificationText(notification);
	var url = getNotificationUrl(notification);
	var className = notification.opened ? "" : "active";

	if (notification.notificationType == "postLike" || notification.notificationType == "postReshare" || notification.notificationType == "reply") {
		getNotificationPostHtml(notification, increment);
	}

	return `<a href="${url}" class="resultListItem notification ${className}" data-id="${notification._id}">
				<div class="resultsImageContainer">
					<img src="${userFrom.profilePic}">
				</div>
				<div id="${increment}" class="resultsDetailsContainer">
					<span style="font-weight:500;" class="ellipsis">${text}</span>
				</div>
			</a>`;
}

function getNotificationText(notification) {

	var userFrom = notification.userFrom;

	//var verified = userFrom.verified ? `<img style="height: 1.5em;padding-left:0px;vertical-align: -0.45em;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="Verified"></img>` : "";
	var verifiedBrand = userFrom.verifiedBrand ? `<svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1em;padding-left:0px;vertical-align: -0.2em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg>` : "";
	
	var suffixes = verifiedBrand;

	if(!userFrom.firstName) {
		return alert("user from data not populated");
	}

	if (userFrom.lastName == "") {
		var userFromName = userFrom.firstName;
	}
	else {
		var userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
	}

	var text;

	if(notification.notificationType == "postReshare") {
		text = `${userFromName}${suffixes}  reshared one of your posts`;
	}
	else if (notification.notificationType == "postLike") {
		text = `${userFromName}${suffixes}  liked one of your posts`;
	}
	else if (notification.notificationType == "reply") {
		text = `${userFromName}${suffixes}  replied to one of your posts`;
	}
	else if (notification.notificationType == "follow") {
		text = `${userFromName}${suffixes}  followed you`;
	}

	return `<span class="ellipsis">${text}</span>`;
}

function getNotificationUrl(notification) {

	var url = "#";

	if(notification.notificationType == "postReshare" || notification.notificationType == "postLike" || notification.notificationType == "reply") {
		url = `/post/${notification.entityId}`;
	}
	else if (notification.notificationType == "follow") {
		url = `/profile/${notification.entityId}`;
	}

	return url;
}
