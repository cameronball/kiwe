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
        outputPosts(results, $("#originalPostContainer"));
    })
})

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

function getPostIdFromElement(element) {
    var isRoot = element.hasClass("post");
    var rootElement = isRoot == true ? element : element.closest(".post");
    var postId = rootElement.data().id;

    if(postId === undefined) return alert("Post id undefined");

    return postId;
}

function createPostHtml(postData) {

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

    var reshareText = '';
    if(isReshare) {
        reshareText = `<span><i class='fa-solid fa-repeat'></i>&nbsp;&nbsp;Reshared by <a href='/profile/${resharedBy}'>@${resharedBy}</a></span>`
    }
	
	var replyFlag = '';
	if(postData.replyTo) {
		
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

    return `<div class='post' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${reshareText}
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <a href='/profile/${postedBy.username}' class='displayName'>${displayName}<img style="width:20px;vertical-align:text-top;padding:3px 0px 0px 5px;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="Verified"></img></a>
                            <span class='username'>@${postedBy.username}</span>
                            <span class='date'>${timestamp}</span>
                        </div>
						${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
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
		container.append("<span class='noResults'>Nothing to show.</span>");
	}
}