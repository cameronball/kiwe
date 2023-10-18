// Globals
var cropper;
var timer;
var selectedUsers = [];

$("#postTextarea, #replyTextarea").keyup(event => {
    var textbox = $(event.target);
    var value = textbox.val().trim();

    var isModal = textbox.parents(".modal").length == 1;
    
    var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

    if(submitButton.length == 0) return alert("No submit button found");

    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

    submitButton.prop("disabled", false);
})

$("#submitPostButton, #submitReplyButton").click(() => {
    var button = $(event.target);

	var isModal = button.parents(".modal").length == 1;
	var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

    var data = {
        content: textbox.val()
    }

	if(isModal) {
		var id = button.data().id;
		if(id === null) return alert("Button id is null");
		data.replyTo = id;
	}

    $.post("/api/posts", data, postData => {

		if(postData.replyTo) {
			location.reload();
		}
        else {
			var html = createPostHtml(postData);
			$(".postsContainer").prepend(html);
			textbox.val("");
			button.prop("disabled", true);
		}
    })
})

$("#replyModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
	$("#submitReplyButton").data("id", postId);

    $.get("/api/posts/" + postId, results => {
        outputPosts(results.postData, $("#originalPostContainer"));
    })
})

$("#deletePostModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
	$("#deletePostButton").data("id", postId);
})

$("#confirmPinModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
	$("#pinPostButton").data("id", postId);
})

$("#unpinModal").on("show.bs.modal", (event) => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
	$("#unpinPostButton").data("id", postId);
})

$("#deletePostButton").click((event) => {
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "DELETE",
        success: (data, status, xhr) => {

            if(xhr.status == 403) {
                alert("You do not have permission to perform this action");
                return;
            }

            if(xhr.status != 202) {
                alert("Could not delete post");
                return;
            }

            location.reload();
        }
    })
})

$("#pinPostButton").click((event) => {
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: true },
        success: (data, status, xhr) => {

            if(xhr.status == 403) {
                alert("You do not have permission to perform this action");
                return;
            }

            if(xhr.status != 204) {
                alert("Could not delete post");
                return;
            }

            location.reload();
        }
    })
})

$("#unpinPostButton").click((event) => {
    var postId = $(event.target).data("id");

    $.ajax({
        url: `/api/posts/${postId}`,
        type: "PUT",
        data: { pinned: false },
        success: (data, status, xhr) => {

            if(xhr.status == 403) {
                alert("You do not have permission to perform this action");
                return;
            }

            if(xhr.status != 204) {
                alert("Could not delete post");
                return;
            }

            location.reload();
        }
    })
})

$("#filePhoto").change(function(){
    if(this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("imagePreview");
            image.src = e.target.result;

            if(cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1/1,
                background: false
            });
        }
        reader.readAsDataURL(this.files[0]);
    }
});

$("#coverPhoto").change(function(){
    if(this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("coverPreview");
            image.src = e.target.result;

            if(cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 3 / 1,
                background: false
            });
        }
        reader.readAsDataURL(this.files[0]);
    }
});

$("#imageUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null) {
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/profilePicture",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        });
    });
});

$("#coverPhotoButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null) {
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);

        $.ajax({
            url: "/api/users/coverPhoto",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => location.reload()
        });
    });
});

$("#userSearchTextbox").keydown(function(event) {
	clearTimeout(timer);
	var textbox = $(event.target);
	var value = textbox.val();

    if(value=="" && (event.which == 8 || event.keyCode == 8)) {
        selectedUsers.pop();
        updateSelectedUsersHtml();
        $(".resultsContainer").html("");

        if(selectedUsers.length == 0) {
            $("#createChatButton").prop("disabled", true);
        }
        
        return;
    }

	timer = setTimeout(() => {
		value = textbox.val().trim();
		if (value == "") {
			$(".resultsContainer").html("");
			return;
		}
		else {
			searchUsers(value);
		}
	}, 5);
})

$("#createChatButton").click(() => {
    var data = JSON.stringify(selectedUsers);

    $.post("/api/chats", { users: data }, chat => {

        if(!chat || !chat._id) return alert("Invalid response from server");

        window.location.href = `/messages/${chat._id}`;
    })
});

$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""))

$(document).on("click", ".likeButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);
    
    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            
            button.find("span").text(postData.likes.length || "");

            if(postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active");
				button.find("i").removeClass("fa-regular").addClass("fa-solid");
            }
            else {
                button.removeClass("active");
				button.find("i").removeClass("fa-solid").addClass("fa-regular");
            }

        }
    })

})

$(document).on("click", ".reshareButton", (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);
    
    if(postId === undefined) return;

    $.ajax({
        url: `/api/posts/${postId}/reshare`,
        type: "POST",
        success: (postData) => {            
            button.find("span").text(postData.reshareUsers.length || "");

            if(postData.reshareUsers.includes(userLoggedIn._id)) {
                button.addClass("active");
            }
            else {
                button.removeClass("active");
            }

        }
    })

})

$(document).on("click", ".post", (event) => {
	var element = $(event.target);
	var postId = getPostIdFromElement(element);

	if (postId !== undefined && !element.is("button")) {
		window.location.href = "/post/" + postId;
	}
});

$(document).on("click", ".followButton", (event) => {
    var button = $(event.target);
    var userId = button.data().user;
    
    if (userId === undefined) return;

    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => {

            if(xhr.status == 404) {
                alert("User not found");
                return;
            }

            if(data.following && data.following.includes(userId)) {
                button.addClass("following");
                button.find("span").text("Unfollow");
                button.find("i").removeClass("fa-user-plus").addClass("fa-user-minus");
            }
            else {
                button.removeClass("following");
                button.find("span").text("Follow");
                button.find("i").removeClass("fa-user-minus").addClass("fa-user-plus");
            }

            var followersLabel = $("#followersValue");
            if(followersLabel.length != 0) {
                var followersText = followersLabel.text();
                followersText = parseInt(followersText);
                followersLabel.text(followersText + (data.following && data.following.includes(userId) ? 1 : -1));
            }

        }
    })
});

function getPostIdFromElement(element) {
    var isRoot = element.hasClass("post");
    var rootElement = isRoot == true ? element : element.closest(".post");
    var postId = rootElement.data().id;

    if(postId === undefined) return alert("Post id undefined");

    return postId;
}

function createPostHtml(postData, boldFont = false) {

    if(postData == null) return alert("post object is null");

    var isReshare = postData.reshareData !== undefined;
    var resharedBy = isReshare ? postData.postedBy.username : null;
    postData = isReshare ? postData.reshareData : postData;

    var postedBy = postData.postedBy;

    if(postedBy._id === undefined) {
        return console.log("User object not populated");
    }

    var displayName = postedBy.firstName + " " + postedBy.lastName;
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
	var likeButtonFillIcon = postData.likes.includes(userLoggedIn._id) ? "fa-solid" : "fa-regular";
	
    var reshareButtonActiveClass = postData.reshareUsers.includes(userLoggedIn._id) ? "active" : "";

    //- var boldFontClass = boldFont ? "font-weight-bold" : "";
    var boldFontClass = "";
    var LargeFontStyle = boldFont ? "font-size:23px;" : "";

    var verified = postedBy.verified ? `<img style="height: 1em;padding-left:5px;vertical-align:-0.175em;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="Verified"></img>` : "";
    var verifiedBrand = postedBy.verifiedBrand ? `<svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1.5em;padding-left:0px;vertical-align: -0.45em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg>` : "";
    var squarePicture = postedBy.verifiedBrand ? `style="border-radius: 10%;"` : "";
    
    // Troll verified
    //var verified = postedBy.verified ? `<img style="height: 1em;padding-left:5px;vertical-align:-0.175em;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified"><i class="fa-solid fa-circle-check" style="color:hotpink;"></i><i style="margin-left:5px; color:salmon;" class="fa-solid fa-spell-check"></i><i class="fa-solid fa-calendar-check" style="margin-left:5px; color:#ff5555;"></i><i style="margin-left:5px;" class="fa-solid fa-user-ninja"></i><i style="margin-left:5px;color:#0000ff;" class="fa-solid fa-user-astronaut"></i><i style="margin-left:5px;" class="fa-solid fa-person-through-window"></i><i style="margin-left:5px;color:#eebb55;" class="fa-solid fa-radiation"></i><i style="margin-left:5px;color:#888888;" class="fa-solid fa-person-rifle"></i><i style="margin-left:5px;color:#5555ff;" class="fa-solid fa-person-drowning"></i><i style="margin-left:5px;" class="fa-solid fa-people-robbery"></i><i style="margin-left:5px;color:#22ff00;" class="fa-solid fa-magnifying-glass-dollar"></i><i style="margin-left:5px;" class="fa-solid fa-child-combatant"></i><i style="margin-left:5px;color:#ff0000;" class="fa-solid fa-biohazard"></i><i style="margin-left:5px;" class="fa-solid fa-chess-knight"></i>` : "";
    
    var admin = postedBy.admin ? `<i class="fa-solid fa-user-gear" style="margin-left:5px;" data-toggle="tooltip" data-placement="top" title="Admin"></i>` : "";

    var reshareText = '';
    if(isReshare) {
        reshareText = `<span><i class='fa-solid fa-repeat'></i>&nbsp;&nbsp;Reshared by <a href='/profile/${resharedBy}'>@${resharedBy}</a></span>`
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
						Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
					</div>`
	}

    var buttons = "";
    var pinnedPostText = "";
    if (postData.postedBy._id == userLoggedIn._id) {
        if(postData.pinned === true) {
            buttons = `<button class="unpinButton" data-id="${postData._id}" data-toggle="modal" data-target="#unpinModal"><i class="fa-solid fa-thumbtack"></i></button><button class="deleteButton" data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fa-solid fa-trash"></i></button>`    
        }
        else {
            buttons = `<button class="pinButton" data-id="${postData._id}" data-toggle="modal" data-target="#confirmPinModal"><i class="fa-solid fa-thumbtack"></i></button><button class="deleteButton" data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fa-solid fa-trash"></i></button>`
        }
    }
    else if (userLoggedIn.admin) {
        buttons = `<button class="deleteButton" data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fa-solid fa-trash"></i></button>`
    }

    if(postData.pinned === true) {
        pinnedPostText = `<span><i class="fa-solid fa-thumbtack" style="color: rgb(101, 119, 134);"></i>&nbsp;&nbsp;Pinned<span>`
    }

    if(isReshare && postData.pinned) {
        temp = pinnedPostText;
        pinnedPostText = pinnedPostText + '&nbsp;&nbsp;<span>|</span>&nbsp;&nbsp;' + reshareText;
        reshareText = '';
    }

    return `<div class='post' data-id='${postData._id}'>
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
                            <span><a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>${verifiedBrand}${verified}${admin}</span>
                            <span class='username'>&nbsp;@${postedBy.username}</span>
                            <span class='date'>&nbsp;&nbsp;•&nbsp;&nbsp;${timestamp}</span>
                            <span class='datePlaceholder'></span>
                            ${buttons}
                        </div>
						${replyFlag}
                        <div class='postBody'>
                            <span class="${boldFontClass}" style="${LargeFontStyle}">${postData.content}</span>
                        </div>
                        <div class='postFooter' style="${LargeFontStyle}">
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='fa-regular fa-comments'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='reshareButton ${reshareButtonActiveClass}'>
                                    <i class='fa-solid fa-repeat'></i>
                                    <span>${postData.reshareUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='${likeButtonFillIcon} fa-heart'></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if(elapsed/1000 < 30) return "Just now";
        
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

function outputPosts(results, container) {
	container.html("");

	if(!Array.isArray(results)) {
		results = [results];
	}

	results.forEach(result => {
		var html = createPostHtml(result);
		container.append(html);
	});

	$('[data-toggle="tooltip"]').tooltip()

	if (results.length == 0) {
		container.append("<span class='noResults'>Nothing to show :(</span>");
	}
}

function outputPostsWithReplies(results, container) {
    container.html("");

    if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
        var html = createPostHtml(results.replyTo);
        container.append(html);
    }

    var mainPostHtml = createPostHtml(results.postData, true);
    container.append(mainPostHtml);

    results.replies.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    });
}

function outputUsers(results, container) {
	container.html("");
	
	results.forEach(result => {
		var html = createUserHtml(result, true);
		container.append(html);
	});

	if(results.length == 0) {
		container.append(`<span class='noResults'>Nothing to show :(</span>`);
	}
}

function createUserHtml(userData, showFollowButton) {

    if(userData.lastName == null) {
        userData.lastName = "";
    }
    if(userData.lastName == ""){
        var nameSpace = "";
    }
    else {
        var nameSpace = " ";
    }

	if (showFollowButton && userLoggedIn._id != userData._id) {
		if(userLoggedIn.following && userLoggedIn.following.includes(userData._id)) {
			isFollowing = true;
		}
		else {
			isFollowing = false;
		}
		text = isFollowing ? "Unfollow" : "Follow"
		buttonClass = isFollowing ? "followButton following" : "followButton"
		buttonIcon = isFollowing ? "fa-user-minus" : "fa-user-plus"
		followText = `<div class='followButtonContainer'><button class="${buttonClass}" data-user="${userData._id}"><i class="fa-solid ${buttonIcon}"></i><span>${text}</span></button></div>`
	}
	else {
		followText = "";
	}

    var verified = userData.verified ? `<img style="padding-left:5px;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="Verified"></img>` : "";
    var verifiedBrand = userData.verifiedBrand ? `<svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1.5em;padding-left:5px;vertical-align: -0.45em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg>` : "";

    var squarePicture = userData.verifiedBrand ? "style='border-radius:10%;'" : "";

	return `<div class="user">
				<div class="userImageContainer">
					<img ${squarePicture} src="${userData.profilePic}">
				</div>
				<div class="userDetailsContainer">
					<div class="header">
						<a href='/profile/${userData.username}'>${userData.firstName}${nameSpace}${userData.lastName}</a>
                        ${verifiedBrand}
                        ${verified}
						<span class="username">@${userData.username}</span>
					</div>
					${followText}
				</div>
			</div>`;
}

function searchUsers(searchTerm) {
    $.get("/api/users", { search: searchTerm }, results => {
        outputSelectableUsers(results, $(".resultsContainer"));
    });
}

function outputSelectableUsers(results, container) {
	container.html("");
	
	results.forEach(result => {

        if(result._id == userLoggedIn._id || selectedUsers.some(u => u._id == result._id)) {
            return;
        }

		var html = createUserHtml(result, false);
        var element = $(html);
        element.click(() => userSelected(result));
		container.append(element);
	});

	if(results.length == 0) {
		container.append(`<span class='noResults'>Nothing to show :(</span>`);
	}
}

function userSelected(user) {
    selectedUsers.push(user);
    updateSelectedUsersHtml();
    $("#userSearchTextbox").val("").focus();
    $(".resultsContainer").html("");
    $("#createChatButton").prop("disabled", false);
}

function updateSelectedUsersHtml() {
    var element = []
    selectedUsers.forEach(user => {
        var nameSpace = " "
        if(user.lastName == null){
            user.lastName = "";
        }
        if(user.lastName == ""){
            nameSpace = "";
        }
        var name = user.firstName + nameSpace + user.lastName;
        var userElement = $(`<span class='selectedUser'>${name}</span>`);
        element.push(userElement);
    });

    $(".selectedUser").remove();
    $("#selectedUsers").prepend(element);
}

function getChatName(chatData) {
	var chatName = chatData.chatName;

	if(!chatName) {
		var otherChatUsers = getOtherChatUsers(chatData.users);
		var namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName);
		chatName = namesArray.join(", ");
	}

	return chatName;
}

function getOtherChatUsers(users) {
	if(users.length == 1) return users;

	return users.filter(user => user._id != userLoggedIn._id);
}