// Globals
var cropper;
var timer;
var selectedUsers = [];

$(document).ready(() => {
    refreshMessagesBadge();
    refreshNotificationsBadge();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
        })
        .catch(function(err) {
        console.log('Service Worker registration failed: ', err);
        });
    }
});

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
            emitNotification(postData.replyTo.postedBy);
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

$("#postPhoto").change(function(){
    if(this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("postImagePreview");
            image.src = e.target.result;

            if(cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false,
                viewMode: 0
            });
        }
        reader.readAsDataURL(this.files[0]);
    }
});

$("#messagePhoto").change(function(){
    if(this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById("messageImagePreview");
            image.src = e.target.result;

            if(cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false,
                viewMode: 0
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
            success: () => window.location.href = "/profile"
        });
    });
});

$("#imageMessageSendButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null) {
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append("croppedImage", blob);
	formData.append("chatId", chatId);

        $.ajax({
            url: "/api/messages/imageMessage",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: () => window.location.href = "/messages/"+chatId
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
            success: () => window.location.href = "/profile"
        });
    });
});

$("#imagePostUploadButton").click(() => {
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null) {
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

    canvas.toBlob((blob) => {
        var formData = new FormData();
        formData.append('content', $("#imagePostTextarea").val());
        formData.append('croppedImage', blob);
    
        $.ajax({
            url: "/api/posts",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: (postData) => {
                var html = createPostHtml(postData);
                $(".postsContainer").prepend(html);
                $("#imagePostTextarea").val("");
                cropper.destroy();
                $("#imagePostUploadModal").modal("hide");
            }
        });
    });
});

$("#codePostUploadButton").click(() => {
    var codeBoxContent = $("#codePostCodeTextarea").val();

    if(codeBoxContent == "") {
        alert("Enter some code.");
        return;
    }

    var formData = new FormData();
    formData.append('content', $("#codePostTextarea").val());
    formData.append('codeContent', codeBoxContent);

    $.ajax({
        url: "/api/posts",
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: (postData) => {
            var html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            $("#codePostTextarea").val("");
            $("#codePostCodeTextarea").val("");
            $("#codePostUploadModal").modal("hide");
            hljs.highlightAll();
        }
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
				button.find("i").removeClass("far").addClass("fas");
                emitNotification(postData.postedBy);
            }
            else {
                button.removeClass("active");
				button.find("i").removeClass("fas").addClass("far");
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
                emitNotification(postData.postedBy);
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
    var isMainPostBoolean = getIsMainPostFromElement(element);

	if (postId !== undefined && !element.is("button") && !isMainPostBoolean) {
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
                emitNotification(userId);
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

$(document).on("click", ".notification.active", (event) => {
    var container = $(event.target);
    var notificationId = container.data().id;
    
    var href = container.attr("href");
    event.preventDefault();

    var callback = () => window.location = href;
    markNotificationsAsOpened(notificationId, callback);
});

function getPostIdFromElement(element) {
    var isRoot = element.hasClass("post");
    var rootElement = isRoot == true ? element : element.closest(".post");
    var postId = rootElement.data().id;

    if(postId === undefined) return console.log("Post id undefined");

    return postId;
}

function getIsMainPostFromElement(element) {
    var isRoot = element.hasClass("post");
    var rootElement = isRoot == true ? element : element.closest(".post");
    var isMainPost = rootElement.data("mainpostbool");

    if(isMainPost === undefined) return alert("Post id undefined");

    if (isMainPost == "yes") {
        var isMainPostBool = true;
    }
    else {
        var isMainPostBool = false;
    }

    return isMainPostBool;
}

function createPostHtml(postData, boldFont = false) {

    if(postData == null) return alert("post object is null");

    var isReshare = postData.reshareData !== undefined;
    var hasCode = postData.code !== '';
    var resharedBy = isReshare ? postData.postedBy.username : null;
    var codeContent = hasCode ? postData.code : null;
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

    //- var boldFontClass = boldFont ? "font-weight-bold" : "";
    var boldFontClass = "";
    var LargeFontStyle = boldFont ? "font-size:23px;" : "";
    var postPageMainPost = boldFont ? "yes" : "";

    var verified = postedBy.verified ? `<img style="height: 1em;padding-left:5px;vertical-align:-0.175em;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="Verified"></img>` : "";
    var verifiedBrand = postedBy.verifiedBrand ? `<svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1.5em;padding-left:0px;vertical-align: -0.45em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg>` : "";
    var squarePicture = postedBy.verifiedBrand ? `style="border-radius: 10%;"` : "";
    
    // Troll verified
    //var verified = postedBy.verified ? `<img style="height: 1em;padding-left:5px;vertical-align:-0.175em;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified"><i class="fa-solid fa-circle-check" style="color:hotpink;"></i><i style="margin-left:5px; color:salmon;" class="fa-solid fa-spell-check"></i><i class="fa-solid fa-calendar-check" style="margin-left:5px; color:#ff5555;"></i><i style="margin-left:5px;" class="fa-solid fa-user-ninja"></i><i style="margin-left:5px;color:#0000ff;" class="fa-solid fa-user-astronaut"></i><i style="margin-left:5px;" class="fa-solid fa-person-through-window"></i><i style="margin-left:5px;color:#eebb55;" class="fa-solid fa-radiation"></i><i style="margin-left:5px;color:#888888;" class="fa-solid fa-person-rifle"></i><i style="margin-left:5px;color:#5555ff;" class="fa-solid fa-person-drowning"></i><i style="margin-left:5px;" class="fa-solid fa-people-robbery"></i><i style="margin-left:5px;color:#22ff00;" class="fa-solid fa-magnifying-glass-dollar"></i><i style="margin-left:5px;" class="fa-solid fa-child-combatant"></i><i style="margin-left:5px;color:#ff0000;" class="fa-solid fa-biohazard"></i><i style="margin-left:5px;" class="fa-solid fa-chess-knight"></i>` : "";
    
    var admin = postedBy.admin ? `<i class="fad fa-kiwi-bird" style="margin-left:5px;color:#1D9BF0;" data-toggle="tooltip" data-placement="top" title="Kiwi Employee"></i>` : "";

    var verifiedGovernment = postedBy.verifiedGovernment ? `<i class="fad fa-check-circle" style="margin-left:5px;color:#696969;" data-toggle="tooltip" data-placement="top" title="Government Affiliated Account"></i>` : "";

    var reshareText = '';
    if(isReshare) {
        reshareText = `<span><i class='fas fa-repeat'></i>&nbsp;&nbsp;Reshared by <a href='/profile/${resharedBy}'>@${resharedBy}</a></span>`
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
            buttons = `<button class="unpinButton" aria-label="Unpin post" data-id="${postData._id}" data-mainPostBool="${postPageMainPost}" data-toggle="modal" data-target="#unpinModal"><i class="fas fa-thumbtack"></i></button><button class="deleteButton" aria-label="Delete post" data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fad fa-trash"></i></button>`    
        }
        else {
            buttons = `<button class="pinButton" aria-label="Pin post" data-id="${postData._id}" data-mainPostBool="${postPageMainPost}" data-toggle="modal" data-target="#confirmPinModal"><i class="fas fa-thumbtack"></i></button><button class="deleteButton" aria-label="Delete Post" data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fad fa-trash"></i></button>`
        }
    }
    else if (userLoggedIn.admin) {
        buttons = `<button class="deleteButton" data-id="${postData._id}" data-mainPostBool="${postPageMainPost}" aria-label="Delete Post" data-toggle="modal" aria-label="Delete Post" data-target="#deletePostModal"><i class="fad fa-trash"></i></button>`
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
                            <img src='${postData.image}'>
                        </div>`;
        }
        else {
            var image = `<br><div class='postImage'>
                            <img src='${postData.image}'>
                        </div>`;
        }
    }

    if(hasCode) {
        if(postData.content) {
            var codeHtml = `<pre><code>${codeContent}</code></pre>`
        }
        else {
            var codeHtml = `<br><pre><code>${codeContent}</code></pre>`
        }
    }
    else {
        var codeHtml = ``;
    }

    return `<div class='post' data-id='${postData._id}' data-mainPostBool="${postPageMainPost}">
                <div class='postActionContainer'>
                    ${pinnedPostText}
                    ${reshareText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img ${squarePicture} src='${postedBy.profilePic}' alt="${postedBy.firstName}'s Profile Image">
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <span><a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>${verifiedBrand}${verified}${admin}${verifiedGovernment}</span>
                            <span class='username'>&nbsp;@${postedBy.username}</span>
                            <span class='date'>&nbsp;&nbsp;•&nbsp;&nbsp;${timestamp}</span>
                            <span class='datePlaceholder'></span>
                            ${buttons}
                        </div>
						${replyFlag}
                        <div class='postBody'>
                            <span class="${boldFontClass}" style="${LargeFontStyle}">${postData.content}</span>
                            ${codeHtml}
                        </div>
                        ${image}
                        <div class='postFooter' style="${LargeFontStyle}">
                            <div class='postButtonContainer'>
                                <button aria-label="Comment" data-toggle='modal' data-target='#replyModal'>
                                    <i class='fas fa-comments'></i>
                                </button>
                            </div>
                            <div class='postButtonContainer green'>
                                <button aria-label="Reshare" class='reshareButton ${reshareButtonActiveClass}'>
                                    <i class='fas fa-repeat'></i>
                                    <span>${postData.reshareUsers.length || ""}</span>
                                </button>
                            </div>
                            <div class='postButtonContainer red'>
                                <button aria-label="Like" class='likeButton ${likeButtonActiveClass}'>
                                    <i class='${likeButtonFillIcon} fa-heart'></i>
                                    &nbsp;<span>${postData.likes.length || ""}</span>
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

// Create array to store ads in
var ads = [];
// Add ads to array
ads.push(`<div class="post" data-id="65463a609b3c16b8083cbd25">
<div class="postActionContainer">
    <span style="font-size:14px;"><i class="fas fa-ad" style="color:var(--blue);"></i>&nbsp;&nbsp;Paid promotion</span></div>
<div class="mainContentContainer">
    <div class="userImageContainer">
        <img style="border-radius: 10%;" src="/uploads/images/cf1f01d79e5c0b82b2e25b8afb7d92e0.png" alt="Kiwe's Profile Image">
    </div>
    <div class="postContentContainer">
        <div class="header">
            <span><a href="/profile/kiwe" class="displayName">Kiwe</a></span>
            <span class="username">&nbsp;@kiwe</span>
            <i class="fad fa-kiwi-bird" style="margin-left:5px;color:#1D9BF0;" data-toggle="tooltip" data-placement="top" title="" data-original-title="Kiwi Employee"></i>            
        </div>
        
        <div class="postBody">
            <span class="" style="">Update 3 is incoming! Features include new icons, hashtags, image chips and more!</span>
        </div>
        <div class="postFooter" style="">
            <div class="postButtonContainer">
                <button aria-label="Comment" data-toggle="modal" data-target="#replyModal">
                    <i class="fas fa-comments"></i>
                </button>
            </div>
            <div class="postButtonContainer green">
                <button aria-label="Reshare" class="reshareButton ">
                    <i class="fas fa-repeat"></i>
                    <span></span>
                </button>
            </div>
            <div class="postButtonContainer red">
                <button aria-label="Like" class="likeButton ">
                    <i class="far fa-heart"></i>
                    &nbsp;<span></span>
                </button>
            </div>
        </div>
    </div>
</div>
</div>`);

ads.push(`<div class="post" data-id="6546432f56a7bbae36bc7d0c">
<div class="postActionContainer"><span style="font-size:14px;"><i class="fas fa-ad" style="color: var(--blue);"></i>&nbsp;&nbsp;Paid promotion</span></div>
<div class="mainContentContainer">
    <div class="userImageContainer">
        <img style="border-radius: 10%;" src="/uploads/images/3e995925d43fc8c5975379bb80b87758.png" alt="Amazon's Profile Image">
    </div>
    <div class="postContentContainer">
        <div class="header">
            <span><a href="/profile/amazon" class="displayName">Amazon</a><svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1.5em;padding-left:0px;vertical-align: -0.45em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg></span>
            <span class="username">&nbsp;@amazon</span>
        </div>    
        <div class="postBody">
            <span class="" style="">Why “Save for Later” when you can “Buy Now”? 🤔</span>
        </div>
        <div class="postFooter" style="">
            <div class="postButtonContainer">
                <button aria-label="Comment" data-toggle="modal" data-target="#replyModal">
                    <i class="fas fa-comments"></i>
                </button>
            </div>
            <div class="postButtonContainer green">
                <button aria-label="Reshare" class="reshareButton ">
                    <i class="fas fa-repeat"></i>
                    <span></span>
                </button>
            </div>
            <div class="postButtonContainer red">
                <button aria-label="Like" class="likeButton ">
                    <i class="far fa-heart"></i>
                    &nbsp;<span></span>
                </button>
            </div>
        </div>
    </div>
</div>
</div>`);

ads.push(`<div class="post" data-id="654645e0bbe171788dd7ada7">
<div class="postActionContainer">
    <span style="font-size:14px;"><i class="fas fa-ad" style="color:var(--blue);"></i>&nbsp;&nbsp;Paid promotion</span></div>
<div class="mainContentContainer">
    <div class="userImageContainer">
        <img style="border-radius: 10%;" src="/uploads/images/54a36063d2976f634eb5ef48d45a75e6.png" alt="Google's Profile Image">
    </div>
    <div class="postContentContainer">
        <div class="header">
            <span><a href="/profile/google" class="displayName">Google</a><svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1.5em;padding-left:0px;vertical-align: -0.45em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg></span>
            <span class="username">&nbsp;@google</span>
            
            
            
        </div>
        
        <div class="postBody">
            <span class="" style="">Run into a friend? Just start talking and <a style="color:var(--blue);" href="https://kiwe.social/search/query/%23PixelBuds">#PixelBuds</a> Pro will use AI to automatically pause your audio and turn on transparency mode so you can focus on your conversation.

<a style="color:var(--blue);" href="https://kiwe.social/search/query/%23MadeByGoogle">#MadeByGoogle</a></span>
        </div>
        <div class="postFooter" style="">
            <div class="postButtonContainer">
                <button aria-label="Comment" data-toggle="modal" data-target="#replyModal">
                    <i class="fas fa-comments"></i>
                </button>
            </div>
            <div class="postButtonContainer green">
                <button aria-label="Reshare" class="reshareButton ">
                    <i class="fas fa-repeat"></i>
                    <span></span>
                </button>
            </div>
            <div class="postButtonContainer red">
                <button aria-label="Like" class="likeButton ">
                    <i class="far fa-heart"></i>
                    &nbsp;<span></span>
                </button>
            </div>
        </div>
    </div>
</div>
</div>`);

function outputPosts(results, container) {
    var adIncrement = 5;
	container.html("");

	if(!Array.isArray(results)) {
		results = [results];
	}

	results.forEach(result => {
		var html = createPostHtml(result);
		container.append(html);
        hljs.highlightAll();
        var random = Math.floor(Math.random() * 4) + 5;
        if (adIncrement >= random) {
            if (ads.length == 0) {
                adIncrement = 0;
            }
            else {
                var randomAdId = Math.floor(Math.random() * ads.length);
                container.append(ads[randomAdId]);
                // Remove that ad from ads
                ads.splice(randomAdId, 1);
                adIncrement = 0;
            }
        }
        adIncrement++;
	});

	$('[data-toggle="tooltip"]').tooltip()

	if (results.length == 0) {
		container.append("<span class='noResults'>Nothing to show :(</span>");
	}
}

function outputPostsWithReplies(results, container) {
    container.html("");
    if(results.replyTo !== undefined && results.replyTo === null) {
        container.append("<span class='noResults'>Original post was deleted</span>")
    }
    else if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
        var html = createPostHtml(results.replyTo);
        container.append(html);
        hljs.highlightAll();
    }

    var mainPostHtml = createPostHtml(results.postData, true);
    container.append(mainPostHtml);
    hljs.highlightAll();

    results.replies.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
        hljs.highlightAll();
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
		followText = `<div class='followButtonContainer'><button class="${buttonClass}" data-user="${userData._id}"><i class="fas ${buttonIcon}"></i><span>${text}</span></button></div>`
	}
	else {
		followText = "";
	}

    var verified = userData.verified ? `<img style="padding-left:5px;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="Verified"></img>` : "";
    var verifiedBrand = userData.verifiedBrand ? `<svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1.5em;padding-left:5px;vertical-align: -0.45em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg>` : "";
    var verifiedGovernment = userData.verifiedGovernment ? `<i class="fas fa-circle-check" style="padding-left:5px;color:#696969;" data-toggle="tooltip" data-placement="top" title="Government Affiliated Account"></i>` : "";

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
                        ${verifiedGovernment}
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

function messageReceived(newMessage) {
    if($(`[data-room=${newMessage.chat._id}]`).length == 0) {
        showMessagePopup(newMessage);
    }
    else {
        addChatMessageHtml(newMessage);
    }

    refreshMessagesBadge();
}

function markNotificationsAsOpened(notificationId = null, callback = null) {
    if(callback == null) callback = () => location.reload();

    var url = notificationId != null ? `/api/notifications/${notificationId}/markAsOpened` : `/api/notifications/markAsOpened`;
    $.ajax({
        url: url,
        type: "PUT",
        success: () => callback()
    })
}

function refreshMessagesBadge() {
    $.get("/api/chats", { unreadOnly: true }, (data) => {
        var numResults = data.length;

        if(numResults > 0) {
            $("#messagesBadge").text(numResults).addClass("active");
        }
        else {
            $("#messagesBadge").text("").removeClass("active");
        }
    })
}

function refreshNotificationsBadge() {
    $.get("/api/notifications", { unreadOnly: true }, (data) => {
        var numResults = data.length;

        if(numResults > 0) {
            $("#notificationsBadge").text(numResults).addClass("active");
        }
        else {
            $("#notificationsBadge").text("").removeClass("active");
        }
    })
}

function createChatHtml(chatData) {
	var chatName = getChatName(chatData);
	var image = getChatImageElements(chatData);
	var latestMessage = getLatestMessage(chatData.latestMessage);

  	var activeClass = !chatData.latestMessage || chatData.latestMessage.readBy.includes(userLoggedIn._id) ? "" : "active";

	return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
				${image}
				<div class='resultsDetailsContainer ellipsis'>
					<span class='heading ellipsis'>${chatName}</span>
					<span class='subText ellipsis'>${latestMessage}</span>
				</div>
			</a>`
}

function getLatestMessage(latestMessage) {
	if(latestMessage != null) {
		var sender = latestMessage.sender;
		let senderName = "";

		if (sender.lastName == "") {
			senderName = `${sender.firstName}`;
		}
		else {
			senderName = `${sender.firstName} ${sender.lastName}`;
		}

		if (latestMessage.content !== undefined) {
			return `${senderName}: ${latestMessage.content}`;
		}
		else if (latestMessage.imageMessage !== undefined) {
			return `${senderName}: Image Message`;
		}
	}

	return "New chat";
}

function getChatImageElements(chatData) {
	var otherChatUsers = getOtherChatUsers(chatData.users);
	var groupChatClass = "";
	var chatImage = getUserChatImageElement(otherChatUsers[0]);

	if(otherChatUsers.length > 1) {
		groupChatClass = "groupChatImage";
		chatImage += getUserChatImageElement(otherChatUsers[1]);
	}

	return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`
}

function getUserChatImageElement(user) {
	if(!user || !user.profilePic) {
		return alert("User passed into function is invalid");
	}

	return `<img src='${user.profilePic}' alt="User's profile pic">`
}

function showNotificationPopup(data) {
    var html = createBasicNotificationHtml(data);
    var element = $(html);

    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => element.fadeOut(400), 5000);
}

function showMessagePopup(data) {

    // TODO - if new chat this won't work, need to find another way cuz it can't check if ._id is set without erroring
    if(!data.chat.latestMessage._id) {
        data.chat.latestMessage = data;
    }

    var html = createChatHtml(data.chat);
    var element = $(html);

    element.hide().prependTo("#notificationList").slideDown("fast");

    setTimeout(() => element.fadeOut(400), 5000);
}

function outputBasicNotificationsList(notifications, container,) {
	var increment = 0;
	for (const notification of notifications) {
		var html =  createBasicNotificationHtml(notification, increment);
		container.append(html);
		increment++;
	}

	if (notifications.length == 0) {
		container.append("<span class='noResults'>No notifications? It's almost as if your phone is trying to tell you something.</span>");
	}
}



function createBasicNotificationHtml(notification, increment) {
	var userFrom = notification.userFrom;
	var text = getBasicNotificationText(notification);
	var url = getBasicNotificationUrl(notification);
	var className = notification.opened ? "" : "active";

	return `<a href="${url}" class="resultListItem notification ${className}" data-id="${notification._id}">
				<div class="resultsImageContainer">
					<img src="${userFrom.profilePic}">
				</div>
				<div id="${increment}" class="resultsDetailsContainer ellipsis">
					<span style="font-weight:500;" class="ellipsis">${text}</span>
				</div>
			</a>`;
}

function getBasicNotificationText(notification) {

	var userFrom = notification.userFrom;

	//var verified = userFrom.verified ? `<img style="height: 1.5em;padding-left:0px;vertical-align: -0.45em;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="Verified"></img>` : "";
	var verifiedBrand = userFrom.verifiedBrand ? `<svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1.5em;padding-left:0px;vertical-align: -0.45em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg>` : "";
	
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

function getBasicNotificationUrl(notification) {

	var url = "#";

	if(notification.notificationType == "postReshare" || notification.notificationType == "postLike" || notification.notificationType == "reply") {
		url = `/post/${notification.entityId}`;
	}
	else if (notification.notificationType == "follow") {
		url = `/profile/${notification.entityId}`;
	}

	return url;
}

$("#changeBioButton").click(() => {
	$.ajax({
		url: "/api/settings/bio/",
		type: "PUT",
		data: { bio: $("#bioTextbox").val() },
		success: (data, status, xhr) => {
			window.location.href = "/profile";
		},
		error: (xhr, status, error) => {
			$(".errorMessageBio").text("An error occured.");
			$(".errorMessageBio").append("<br>");
		}
	});
});
