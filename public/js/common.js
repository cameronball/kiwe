// Initialise globals
var cropper;
var timer;
var selectedUsers = [];

// Run this code on page load
$(document).ready(() => {
    // Run the functions to refresh the number of unread notifications and messages
    refreshMessagesBadge();
    refreshNotificationsBadge();

    // If the user has installed the app and the service worker is available
    if ('serviceWorker' in navigator) {
	// Register the service worker
        navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
        })
        .catch(function(err) {
			// Log any errors encountered when registering the service worker
        console.log('Service Worker registration failed: ', err);
        });
    }
});

// Run this function when the user keyups on the post text area or reply text area
$("#postTextarea, #replyTextarea").keyup(event => {
    // Get the textbox supplied
    var textbox = $(event.target);
	// Get the value of the content in the textbox minus any whitespace
    var value = textbox.val().trim();

	// Determine whether the parent is a modal
    var isModal = textbox.parents(".modal").length == 1;

	// Determine which submit button must be referenced based on if the parent is a modal, if the box is in a modal, it is a reply box, if it isn't then it is a post text box.
    var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

	// Return an error if there is no submit button found.
    if(submitButton.length == 0) return alert("No submit button found");

	// If the textbox doesn;t have any content, then disable the submit button.
    if (value == "") {
        submitButton.prop("disabled", true);
        return;
    }

	// If the textbox does have content, enable the button (set disabled to false)
    submitButton.prop("disabled", false);
})

// Function to be ran when the submit post or reply buttons are clicked
$("#submitPostButton, #submitReplyButton").click(() => {
	// Get the button that was clicked
    var button = $(event.target);

	// Get whether the parent is a modal
	var isModal = button.parents(".modal").length == 1;
	// Determine whether to use the reply or post text area due to whether its a modal for same logic as in previous function
	var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

	// Get the data
    var data = {
		// Get the value of the textbox and save it as content
        content: textbox.val()
    }

	// If it is a modal, it is a reply and needs to reference who it is replying to.
	if(isModal) {
		// Get the ID of the post being replied to.
		var id = button.data().id;
		// Return an error if the ID cannot be found.
		if(id === null) return alert("Button id is null");
		// Add a replyTo field to the data array with the ID of the post being replied to.
		data.replyTo = id;
	}

	// Run a post request to the /api/posts routes, passing the data and postData
    $.post("/api/posts", data, postData => {

		// If the post was a reply to someone
		if(postData.replyTo) {
			// Send a notification to them telling them that someone replied to their post
            emitNotification(postData.replyTo.postedBy);
			// Reload the page
			location.reload();
		}
        else {
			// If it is not a reply, get the html to render to the page
			var html = createPostHtml(postData);
			// Render the new post to the end of the postContainer container
			$(".postsContainer").prepend(html);
			// Empty the texbox
			textbox.val("");
			// Re-disable the button
			button.prop("disabled", true);
		}
    })
})

// Code to be ran when the reply to post modal is opened
$("#replyModal").on("show.bs.modal", (event) => {
	// Get the reference to the button in the modal
    var button = $(event.relatedTarget);
	// Get the ID of the post being replied to
    var postId = getPostIdFromElement(button);
	// Add the ID retrived to the submit button for easier retrival when submitting the reply.
	$("#submitReplyButton").data("id", postId);

	// Run a get request to the /api/posts/[postID] route to get the post that is being replied to
    $.get("/api/posts/" + postId, results => {
		// Output the obtained post above the textbox so that the user can see the post that they are replying to whilst the reply modal is open.
        outputPosts(results.postData, $("#originalPostContainer"));
    })
})

// Code to be ran when the delete post modal is opened
$("#deletePostModal").on("show.bs.modal", (event) => {
	// Get the button
    var button = $(event.relatedTarget);
	// Get the relevant post ID
    var postId = getPostIdFromElement(button);
	// Add the ID to the delete post button for easier retrival
	$("#deletePostButton").data("id", postId);
})

$("#confirmPinModal").on("show.bs.modal", (event) => {
	// Get the button
    var button = $(event.relatedTarget);
	// Get the relevant post ID
    var postId = getPostIdFromElement(button);
	// Add the ID to the pin post button for easier retrival
	$("#pinPostButton").data("id", postId);
})

$("#unpinModal").on("show.bs.modal", (event) => {
	// Get the button
    var button = $(event.relatedTarget);
	// Get the relevant post ID
    var postId = getPostIdFromElement(button);
	// Add the ID to the unpin post button for easier retrival
	$("#unpinPostButton").data("id", postId);
})

// Code to be ran when the user clicks on the delete post button
$("#deletePostButton").click((event) => {
	// Get the relevant post ID
    var postId = $(event.target).data("id");

	// Run an AJAX request
    $.ajax({
		// Send the request to the /api/posts/[postID] route
        url: `/api/posts/${postId}`,
		// The request is of type DELETE
        type: "DELETE",
		// On successful send
        success: (data, status, xhr) => {

			// If the user is not authenticated (403 error)
            if(xhr.status == 403) {
				// Alert them of the error and stop execution
                alert("You do not have permission to perform this action");
                return;
            }

			// If there is another error, let the user know
            if(xhr.status != 202) {
                alert("Could not delete post");
                return;
            }
			
			// Otherwise, the post was deleted successfully and the page is reloaded to reflect this.
            location.reload();
        }
    })
})

// Code to be ran when the user clicks the pin post button
$("#pinPostButton").click((event) => {
	// Get the relevant post id
    var postId = $(event.target).data("id");

	// Issue and ajax request
    $.ajax({
		// Send the request to the relevant url
        url: `/api/posts/${postId}`,
		// Request type of PUT
        type: "PUT",
		// Send data requesting that the post be pinned
        data: { pinned: true },
		// On successful send
        success: (data, status, xhr) => {

			// Let the user know if request refused due to insufficient permissions and then stop execution of the function
            if(xhr.status == 403) {
                alert("You do not have permission to perform this action");
                return;
            }

			// Inform the user of any other errors and stop execution of the function
            if(xhr.status != 204) {
                alert("Could not delete post");
                return;
            }
			
			// Reload the page
            location.reload();
        }
    })
})

$("#unpinPostButton").click((event) => {
	// Get the relevant post ID
    var postId = $(event.target).data("id");

	// Send an AJAX request
    $.ajax({
		// Send it to the relevant URL
        url: `/api/posts/${postId}`,
		// Request type of PUT
        type: "PUT",
		// Send data requesting for the post to be unpinned
        data: { pinned: false },
		// On successful send
        success: (data, status, xhr) => {

			// If the request is denied due to lack of permissions, inform the user and stop execution of the function.
            if(xhr.status == 403) {
                alert("You do not have permission to perform this action");
                return;
            }

			// Inform the user of any other errors and stop execution of the function.
            if(xhr.status != 204) {
                alert("Could not delete post");
                return;
            }

			// If successful, reload the page.
            location.reload();
        }
    })
})

// Code to be ran when the user clicks on the first option in a poll
$(document).on("click", "#pollSelection1", (event) => {
	// Get the relevant post ID
    var postId = $(event.target).data("id");

	// Issue an ajax request
    $.ajax({
		// Send it to the correct route
        url: `/api/posts/${postId}/vote`,
		// Of type PUT
        type: "PUT",
		// Send data indicating the user is voting for option 1
	data: { voteChoice: false },
		// On successful send
        success: (data, status, xhr) => {

			// Alert and end execution if user has insufficient permissions
            if(xhr.status == 403) {
                alert("You do not have permission to perform this action");
                return;
            }

			// Alert and end execution for any other errors
            if(xhr.status != 202) {
                alert("Could not cast your vote.");
                return;
            }

			// If successful reload the page
            location.reload();
        },
	// On error
	error: (data, status, xhr) => {
		// Reload the page as could be an issue with poll caching
		location.reload();
	}
    })
})

// Code to be ran when the user clicks on the second option in a poll
$(document).on("click", "#pollSelection2", (event) => {
	// Get the relevant post ID
    var postId = $(event.target).data("id");

	// Issue an ajax request
    $.ajax({
		// Send it to the correct route
        url: `/api/posts/${postId}/vote`,
		// Of type PUT
        type: "PUT",
		// Send data indicating the user is voting for option 2
	data: { voteChoice: true },
		// On successful send
        success: (data, status, xhr) => {

			// Alert and end execution if user has insufficient permissions
            if(xhr.status == 403) {
                alert("You do not have permission to perform this action");
                return;
            }

			// Alert and end execution for any other errors
            if(xhr.status != 202) {
                alert("Could not cast your vote.");
                return;
            }

			// If successful reload the page
            location.reload();
        },
	// On error
	error: (data, status, xhr) => {
		// Reload the page as could be an issue with poll caching
		location.reload();
	}
    })
})

// Code to be ran when a user uploads a file
$("#filePhoto").change(function(){
	// Make sure there is a file contained
    if(this.files && this.files[0]) {
		// Create a new file reader
        var reader = new FileReader();
		// Once the reader loads
        reader.onload = (e) => {
			// Get the image
            var image = document.getElementById("imagePreview");
			// Get the source of the image
            image.src = e.target.result;

			// Destroy the cropper element
            if(cropper !== undefined) {
                cropper.destroy();
            }

			// Create a new cropper element with correct options
            cropper = new Cropper(image, {
                aspectRatio: 1/1,
                background: false
            });
        }
		// Get the URL of the uploaded image
        reader.readAsDataURL(this.files[0]);
    }
});

// Code to be ran when a user uploads a file
$("#coverPhoto").change(function(){
	// Make sure there is a file contained
    if(this.files && this.files[0]) {
		// Create a new file reader
        var reader = new FileReader();
		// Once the reader loads
        reader.onload = (e) => {
			// Get the image
            var image = document.getElementById("coverPreview");
			// Get the source of the image
            image.src = e.target.result;

			// Destroy the cropper element
            if(cropper !== undefined) {
                cropper.destroy();
            }

			// Create a new cropper element with correct options
            cropper = new Cropper(image, {
                aspectRatio: 3 / 1,
                background: false
            });
        }
        reader.readAsDataURL(this.files[0]);
		// Get the URL of the uploaded image
    }
});

// Same as previous 2 functions
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

// Same as previous 3 functions
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

// Code to be ran when the user clicks on the image upload button
$("#imageUploadButton").click(() => {
	// Create a new canvas with cropper
    var canvas = cropper.getCroppedCanvas();

	// If the canvas doesn't exist
    if(canvas == null) {
		// There was an error creating the canvas, alert the user
        alert("Could not upload image. Make sure it is an image file.");
		// End function execution
        return;
    }

	// Convert the image to storable blob format
    canvas.toBlob((blob) => {
		// Create a new form data object
        var formData = new FormData();
		// Add the cropped image to the payload
        formData.append("croppedImage", blob);

		// Send an ajax request
        $.ajax({
			// Send it to the correct URL
            url: "/api/users/profilePicture",
			// Of type POST
            type: "POST",
			// Send the form data
            data: formData,
			// Don't process
            processData: false,
			// Content type image
            contentType: false,
			// On success, show successful page
            success: () => window.location.href = "/profile"
        });
    });
});

// When the image message send button is clicked, this function will be ran
$("#imageMessageSendButton").click(() => {
	// Create a cropper canvas
    var canvas = cropper.getCroppedCanvas();

	// If the canvas doesn;t exist
    if(canvas == null) {
		// There was an error, alert and end execution
        alert("Could not upload image. Make sure it is an image file.");
        return;
    }

	// Convert to storable blob format
    canvas.toBlob((blob) => {
		// Create new form data object
        var formData = new FormData();
		// Add the cropped image to it
        formData.append("croppedImage", blob);
		// Add the relevent chatID
		formData.append("chatId", chatId);

		// Issue an AJAX request
        $.ajax({
			// Send it to the relevant URL
            url: "/api/messages/imageMessage",
			// Type of POST
            type: "POST",
			// Send the previously defined form data
            data: formData,
			// Don't process
            processData: false,
			// Type of image
            contentType: false,
			// On success
            success: () => {
		    //addChatMessageHtml(formData);
			// Reflect the changes
		    window.location.href = "/messages/"+chatId;
	    }
        });
    });
});

// Function to be ran when the cover photo button is clicked
$("#coverPhotoButton").click(() => {
	// Get the cropped canvas
    var canvas = cropper.getCroppedCanvas();

	// If the canvas is null
    if(canvas == null) {
		// ALert the user
        alert("Could not upload image. Make sure it is an image file.");
		// Halt execution
        return;
    }

	// Get the canvas in blob format
    canvas.toBlob((blob) => {
		// Create a new formdata object
        var formData = new FormData();
		// Add the cropped image in blob format to the form data
        formData.append("croppedImage", blob);

		// Issue an aja request
        $.ajax({
			// Send it to the relevant url
            url: "/api/users/coverPhoto",
			// Request type of POST
            type: "POST",
			// Include the form data
            data: formData,
			// Dont process
            processData: false,
			// COntent type 0
            contentType: false,
			// Redirect user on success
            success: () => window.location.href = "/profile"
        });
    });
});

// Same as the previous function
$("#imagePostUploadButton").click(() => {
	// Get canvas
    var canvas = cropper.getCroppedCanvas();

    if(canvas == null) {
		//Alert user
        alert("Could not upload image. Make sure it is an image file.");
		// Halt execution
        return;
    }

	// Get as blob
    canvas.toBlob((blob) => {
        var formData = new FormData();
		// Append data
        formData.append('content', $("#imagePostTextarea").val());
        formData.append('croppedImage', blob);

		// Issue equest
        $.ajax({
            url: "/api/posts",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
			// On success
            success: (postData) => {
				// Create html to be rendered
                var html = createPostHtml(postData);
				// Prepend the post
                $(".postsContainer").prepend(html);
				// Reset everything
                $("#imagePostTextarea").val("");
                cropper.destroy();
                $("#imagePostUploadModal").modal("hide");
            }
        });
    });
});

// To be ran when the code posr upload button is clicked
$("#codePostUploadButton").click(() => {
	// Get the contents of the code box textbox
    var codeBoxContent = $("#codePostCodeTextarea").val();

	// If it is empty
    if(codeBoxContent == "") {
		// Alert the user
        alert("Enter some code.");
		// Halt execution of the function
        return;
    }

	// Create new form data object
    var formData = new FormData();
	// Append the code post text content
    formData.append('content', $("#codePostTextarea").val());
	// Append the code content
    formData.append('codeContent', codeBoxContent);

	// Send an ajax request
    $.ajax({
		// To the posts api route
        url: "/api/posts",
		// POST type
        type: "POST",
		// Include form data
        data: formData,
		// Dont process data
        processData: false,
		// Content type 0
        contentType: false,
		// On success
        success: (postData) => {
			// Create html to be render
            var html = createPostHtml(postData);
			// Render the html - prepend it to the start of the posts container
            $(".postsContainer").prepend(html);
			// Reset everything
            $("#codePostTextarea").val("");
            $("#codePostCodeTextarea").val("");
            $("#codePostUploadModal").modal("hide");
			// Ensure code boxes are highlighted
            hljs.highlightAll();
        }
    });
});

// Code to be ran when the poll post upload button is clicked
$("#pollPostUploadButton").click(() => {
	// Get what user inputted for poll option 1
    var option1 = $("#pollOption1").val();
	// Get what the user inputted for poll option 2
    var option2 = $("#pollOption2").val();
	// Get the poll title cntent
    var pollTitle = $("#pollPostTitleTextarea").val();

	// If any of the extracted contents are empty
    if(option1 == "" || option2 == "" || pollTitle == "") {
		// Alert the user
        alert("Enter poll options and title");
		// Halt execution of the function
        return;
    }

	// Create a new form data object
    var formData = new FormData();
	// Append the content from the poll post textarea to form data
    formData.append('content', $("#pollPostTextarea").val());
	// Add the poll title
    formData.append('pollTitle', pollTitle);
	// Add the first option
    formData.append('option1', option1);
	// Add the second option
    formData.append('option2', option2);

	// Send an ajax request
    $.ajax({
		// Send it to the posts api route
        url: "/api/posts",
		// POST type
        type: "POST",
		// Include the form data
        data: formData,
		// Dont process
        processData: false,
		// Content type 0
        contentType: false,
		// On success
        success: (postData) => {
			// Get post html
            var html = createPostHtml(postData);
			// Render at the start of the posts container
            $(".postsContainer").prepend(html);
			// Clear and reset everything
            $("#pollPostTitleTextarea").val("");
            $("#pollPostTextarea").val("");
			$("#pollOption1").val("");
			$("#pollOption2").val("");
            $("#pollUploadModal").modal("hide");
        }
    });
});

// Function to be ran when any key is pressed by the user in the user search textbox
$("#userSearchTextbox").keydown(function(event) {
	// Call the clear timeot function, passing in the existing timer object
	clearTimeout(timer);
	// Get the relevant textbox
	var textbox = $(event.target);
	// Get the value in the textbox
	var value = textbox.val();

	// If the textbox is empty, and the last key pressed was the backspace (code 8)
    if(value=="" && (event.which == 8 || event.keyCode == 8)) {
		// Remove the selected user at the end of the stack
        selectedUsers.pop();
		// Render the update to the page
        updateSelectedUsersHtml();
		// Clear the results container
        $(".resultsContainer").html("");

		// If there ae no selected users
        if(selectedUsers.length == 0) {
			// Disable the button to create a chat if no users are selected
            $("#createChatButton").prop("disabled", true);
        }

		// Halt execution
        return;
    }

	// Create timer object
	timer = setTimeout(() => {
		// Set value var to be the contents of the textbox, not including whitespace
		value = textbox.val().trim();
		// If the textbox is empty
		if (value == "") {
			// Clear the results container
			$(".resultsContainer").html("");
			// Halt execution
			return;
		}
		else {
			// Search for users using the value of the textbox
			searchUsers(value);
		}
		// Run the timer unciton every 5ms
	}, 5);
})

// Code to be ran when the create chat button is clicked.
$("#createChatButton").click(() => {
	// Set the data var to be a stringified version of the selectedUsers array
    var data = JSON.stringify(selectedUsers);

	// Issue a post request to the chats api endpoint passing the selected users stringified var
    $.post("/api/chats", { users: data }, chat => {

		// If the server doesn't respond with a chat, or if the retured chat doesn't contain an id, something has gone wrong and we should alert the user of this
        if(!chat || !chat._id) return alert("Invalid response from server");

		// If all went well, redirect the user to the newly created chat
        window.location.href = `/messages/${chat._id}`;
    })
});

// When the reply modal is hidden, reset it
$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""))

// When any post like buttons are clicked, run this funciton0
$(document).on("click", ".likeButton", (event) => {
	// Get the particular like button that was clicked
    var button = $(event.target);
	// Get the post ID from the button
    var postId = getPostIdFromElement(button);

	// If postID was not found, halt execution as something has gone wrong
    if(postId === undefined) return;

	// Issue an ajax request
    $.ajax({
		// Send it to the posts api endpoint, passing the postID and that the user wishes to like the post
        url: `/api/posts/${postId}/like`,
		// PUT type
        type: "PUT",
		// On success
        success: (postData) => {

			// Find the span element within the button, set the span to contain the number of likes, or to be empty if there are not any likes
            button.find("span").text(postData.likes.length || "");

			// If the current user has liked this post
            if(postData.likes.includes(userLoggedIn._id)) {
				// Make the button red
                button.addClass("active");
				// Make the button solid
				button.find("i").removeClass("far").addClass("fas");
				// Send a notification saying the post was liked
                emitNotification(postData.postedBy);
            }
			// If user is unliking
            else {
				// Make button regular colour
                button.removeClass("active");
				// Make button hollow
				button.find("i").removeClass("fas").addClass("far");
            }

        }
    })

})

// If the reshare button is clicked
$(document).on("click", ".reshareButton", (event) => {
	// Get the relevant button
    var button = $(event.target);
	// Get the post id from the button
    var postId = getPostIdFromElement(button);

	// If the post was not found, halt execution
    if(postId === undefined) return;

	// Send an ajax request
    $.ajax({
		// Send it to the posts api route, passing the post Id and that the user wishes to reshare
        url: `/api/posts/${postId}/reshare`,
		// Type: POST
        type: "POST",
		// On success
        success: (postData) => {            
			// Add the number of reshares next to the reshare button or make it empty if there are none
            button.find("span").text(postData.reshareUsers.length || "");

			// If the current user has reshared
            if(postData.reshareUsers.includes(userLoggedIn._id)) {
				// Make reshare button green
                button.addClass("active");
				// Send the relevant notification
                emitNotification(postData.postedBy);
            }
			// If unreshare
            else {
				// Make  button regular colour
                button.removeClass("active");
            }

        }
    })

})

// Code to be ran when the bookmark button is clicked
$(document).on("click", ".bookmarkButton", (event) => {
	// Fix bug where clicking the bookmark button would cause this function to be ran many times, 
    event.stopPropagation();
	// Get the relevant button
    var button = $(event.currentTarget);
	// Get the post id from the button
    var postId = getPostIdFromElement(button);

	// If the post id not found, then halt execution
    if(postId === undefined) return;

	// Issue an ajax request
    $.ajax({
		// Send the request to the bookmarks api endpoint, passing the post id and that the user wishes to bookmark the post
        url: `/api/bookmarks/${postId}/bookmark`,
		// Type of PUT
        type: "PUT",
		// On success
        success: (newUserData) => {
            // Check if the post is already bookmarked
            var bookmarkIndex = userLoggedIn.bookmarks.indexOf(postId);

			// Update the local copy of the user's data so that it includes the updated bookmarks
	    	userLoggedIn = newUserData;

			// Check if the post is currently bookmarked
            if (bookmarkIndex === -1) {
                // Post is not bookmarked, so add it
                button.addClass("active");
                button.find("i").removeClass("far").addClass("fas");
            } else {
                // Post is already bookmarked, so remove it
                button.removeClass("active");
                button.find("i").removeClass("fas").addClass("far");
            }
        }
    });
});

// When the user clicks on a post
$(document).on("click", ".post", (event) => {
	// Get the element the user cicked on
	var element = $(event.target);
	// Get the post id from the element
	var postId = getPostIdFromElement(element);
	// Get whether the post clicked on is the main post in a reply thread (ie the one currently focused)
    var isMainPostBoolean = getIsMainPostFromElement(element);

	// If the post id was found, the element is not a button and it is not the main focused post
	if (postId !== undefined && !element.is("button") && !isMainPostBoolean) {
		// Redirect to the focused post page for the post the user just clicked on
		window.location.href = "/post/" + postId;
	}
});

// When the user clicks on the follow button
$(document).on("click", ".followButton", (event) => {
	// Get the relevant button
    var button = $(event.target);
	// Get the userid from the button
    var userId = button.data().user;

	// If user id not found, halt execution
    if (userId === undefined) return;

	// Issue an ajax request
    $.ajax({
		// Send the request to the users api, passing the target user id and that the current user wishes to update their follow status
        url: `/api/users/${userId}/follow`,
		// Of type put
        type: "PUT",
		// On success
        success: (data, status, xhr) => {

			// If a 404 error is returned
            if(xhr.status == 404) {
				// Alert the user that the user was not found
                alert("User not found");
				// Halt execution
                return;
            }

			// If returned following list includes the target user
            if(data.following && data.following.includes(userId)) {
				// Add class making button solid and blue
                button.addClass("following");
				// Change follow text to say unfollow
                button.find("span").text("Unfollow");
				// Change the follow icon to the unfollow icon
                button.find("i").removeClass("fa-user-plus").addClass("fa-user-minus");
				// Send a notification to the target user
                emitNotification(userId);
            }
            else {
				// Remove the class making the button solid and blue
                button.removeClass("following");
				// Change the unfollow text to say follow
                button.find("span").text("Follow");
				// Change unfollow icon to follow icon
                button.find("i").removeClass("fa-user-minus").addClass("fa-user-plus");
            }

			// Get the followers label
            var followersLabel = $("#followersValue");
			// If followers label found - ie if user is on target user page or elsewhere where the followersvalue is present,
			// there are places such as search where the followers label is not shown, but users can follow other users
            if(followersLabel.length != 0) {
				// Get current content of the followers label
                var followersText = followersLabel.text();
				// Get int from the followers text
                followersText = parseInt(followersText);
				// Set the updated followers label text to either be 1 more or 1 less depending on if the current user followed or unfollowed the target user
                followersLabel.text(followersText + (data.following && data.following.includes(userId) ? 1 : -1));
            }

        }
    })
});

// Code to be ran when a user clicks an unread notification
$(document).on("click", ".notification.active", (event) => {
	// Get the notification container
    var container = $(event.target);

	// Get the ID of the notification from the container
    var notificationId = container.data().id;
	
    // Get the link from the notification container
    var href = container.attr("href");
	// Fix a bug where links were incorrectly parsed
    event.preventDefault();

	// Set the callback to be the location specfified in the href attribute
    var callback = () => window.location = href;
	// Run the function to make the notification as opened and pass in the callback on success
    markNotificationsAsOpened(notificationId, callback);
});

// Function to get post ID from an element
function getPostIdFromElement(element) {
	// Check if the provided element is already the root element
    var isRoot = element.hasClass("post");
	// If the element passed is the root element, set rootelement as it, otherwise find and set the root element
    var rootElement = isRoot == true ? element : element.closest(".post");
	// Set the post id var
    var postId = rootElement.data().id;

	// If post id not found then return an error
    if(postId === undefined) return console.log("Post id undefined");

	// Return the found post id
    return postId;
}

// Function to get whether the provided post is the main focused post
function getIsMainPostFromElement(element) {
	// Same code as previous to get root post element
    var isRoot = element.hasClass("post");
    var rootElement = isRoot == true ? element : element.closest(".post");
	// See if the post has the mainpostbool element
    var isMainPost = rootElement.data("mainpostbool");

	// If mainpostbool not found, return an error
    if(isMainPost === undefined) return alert("Post id undefined");

	// If it is main post, return as such
    if (isMainPost == "yes") {
        var isMainPostBool = true;
    }
	// If not main post, also return as such
    else {
        var isMainPostBool = false;
    }

	// Return result of search
    return isMainPostBool;
}

// Function to create HTML to be rendered from provided post data, post should not be bold unless specified otherwise
function createPostHtml(postData, boldFont = false) {

	// If no data passed return an error
    if(postData == null) return alert("post object is null");

	// If post is a reshare set isReshare to true
    var isReshare = postData.reshareData !== undefined;
	// If post is reshare, set who the post was reshared by
    var resharedBy = isReshare ? postData.postedBy.username : null;
	// If the post is a reshare, set the post data to the reshared post, otherwise leave it as is
    postData = isReshare ? postData.reshareData : postData;
	// If the post has code, set the var as such
    var hasCode = postData.code !== '';
	// Set the code contnt var if the post has code
    var codeContent = hasCode ? postData.code : null;
	// Set the var as to whether the post is a poll
	var hasPoll = postData.pollTitle !== '';
	// Set the poll title
	var pollTitle = hasPoll ? postData.pollTitle : null;
	// Set the first option var
	var option1 = hasPoll ? postData.option1 : null;
	// Set the second option var
	var option2 = hasPoll ? postData.option2 : null;
	// Set the first votes var
	var votes1 = hasPoll ? postData.votes1 : null;
	// Set the second votes var
	var votes2 = hasPoll ? postData.votes2 : null;
	// Set the reply count var
    var replyCount = postData.replyCount;

	// If there are no replies, set the reply count to 0
    if (replyCount === undefined) {
	    replyCount = 0;
    }

	// Set who the post was posted by
    var postedBy = postData.postedBy;

	// If the postedby user doesnt have an id
    if(postedBy._id === undefined) {
		// Return an error as the postedby user object has not been populated
        return console.log("User object not populated");
    }

	// If the user doesnt have a last name set
    if (postedBy.lastName == "") {
		// Set the display name to be just their first name
        var displayName = postedBy.firstName;
    }
    else {
		// If the user has a last name, set their display name to be their first and last names seperated with a space
        var displayName = postedBy.firstName + " " + postedBy.lastName;
    }

	// Set the timestamp using the timeDifference function with the current date using the date class and the object of the date when the post was created 
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

	// Set whether the like button should be red
    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
	// Set whether the like button should be filled
    var likeButtonFillIcon = postData.likes.includes(userLoggedIn._id) ? "fas" : "far";

	// Set whether the bookmark button should be blue
    var bookmarkButtonActiveClass = userLoggedIn.bookmarks.includes(postData._id) ? "active" : "";
	// Set whether the bookmark button should be filled
    var bookmarkButtonFillIcon = userLoggedIn.bookmarks.includes(postData._id) ? "fas" : "far";

	// Set whether the reshare button should be green
    var reshareButtonActiveClass = postData.reshareUsers.includes(userLoggedIn._id) ? "active" : "";

	// Remove bold weight temporarily as just font size looks cleaner
    //- var boldFontClass = boldFont ? "font-weight-bold" : "";
    var boldFontClass = "";
	// Set posts with bold font to hve larger font
    var LargeFontStyle = boldFont ? "font-size:23px;" : "";
	// If the post has bold font, it is the main focused post
    var postPageMainPost = boldFont ? "yes" : "";

	// If the user posting is verified, then add the verification badge
    var verified = postedBy.verified ? `<img style="height: 1em;padding-left:5px;vertical-align:-0.175em;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="Verified"></img>` : "";
	// If the user posting is a verified brand, then add the brand verification badge
    var verifiedBrand = postedBy.verifiedBrand ? `<svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1.5em;padding-left:0px;vertical-align: -0.45em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg>` : "";
	// Verified brands also have a square image rather than circular to further distinguish
    var squarePicture = postedBy.verifiedBrand ? `style="border-radius: 10%;"` : "";
    
    // Testing what the maximum amount of verification badges could be
    //var verified = postedBy.verified ? `<img style="height: 1em;padding-left:5px;vertical-align:-0.175em;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified"><i class="fa-solid fa-circle-check" style="color:hotpink;"></i><i style="margin-left:5px; color:salmon;" class="fa-solid fa-spell-check"></i><i class="fa-solid fa-calendar-check" style="margin-left:5px; color:#ff5555;"></i><i style="margin-left:5px;" class="fa-solid fa-user-ninja"></i><i style="margin-left:5px;color:#0000ff;" class="fa-solid fa-user-astronaut"></i><i style="margin-left:5px;" class="fa-solid fa-person-through-window"></i><i style="margin-left:5px;color:#eebb55;" class="fa-solid fa-radiation"></i><i style="margin-left:5px;color:#888888;" class="fa-solid fa-person-rifle"></i><i style="margin-left:5px;color:#5555ff;" class="fa-solid fa-person-drowning"></i><i style="margin-left:5px;" class="fa-solid fa-people-robbery"></i><i style="margin-left:5px;color:#22ff00;" class="fa-solid fa-magnifying-glass-dollar"></i><i style="margin-left:5px;" class="fa-solid fa-child-combatant"></i><i style="margin-left:5px;color:#ff0000;" class="fa-solid fa-biohazard"></i><i style="margin-left:5px;" class="fa-solid fa-chess-knight"></i>` : "";

	// If the user is an admin, add the admin badge
    var admin = postedBy.admin ? `<i class="fad fa-kiwi-bird" style="margin-left:5px;color:#1D9BF0;" data-toggle="tooltip" data-placement="top" title="Kiwi Employee"></i>` : "";

	// If the user is a verified govrnment, add their respective verification badge
    var verifiedGovernment = postedBy.verifiedGovernment ? `<i class="fad fa-check-circle" style="margin-left:5px;color:#696969;" data-toggle="tooltip" data-placement="top" title="Government Affiliated Account"></i>` : "";

	// Initialise reshare text var
    var reshareText = '';
	// If the post is a reshare
    if(isReshare) {
		// Add the reshare text
        reshareText = `<span><i class='fas fa-repeat'></i>&nbsp;&nbsp;Reshared by <a href='/profile/${resharedBy}'>@${resharedBy}</a></span>`
    }

	// Initialise the reply flag var
	var replyFlag = '';
	// If the post is a reply and the the reply to id is properly set
	if(postData.replyTo && postData.replyTo._id) {

		// If there is no post id
		if(!postData.replyTo._id) {
			// Return an error and alert user
			return alert("Reply to is not populated");
		}
		else if(!postData.replyTo.postedBy._id) {
			// If there is no user id return an error and alert user
			return alert("Posted by is not populated");
		}

		// Get the username of the user being replied to
		var replyToUsername = postData.replyTo.postedBy.username;
		// Create the text saying who is being replied to
		replyFlag = `<div class='replyFlag'>
						Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
					</div>`
	}

	// Initialise buttons var
    var buttons = "";
	// Initalise pinned post text var
    var pinnedPostText = "";
	// If the supplied post was created by the logged in user
    if (postData.postedBy._id == userLoggedIn._id) {
		// If pinned
        if(postData.pinned === true) {
			// Add the unpin button to the buttons var
            buttons = `<button class="unpinButton" aria-label="Unpin post" data-id="${postData._id}" data-mainPostBool="${postPageMainPost}" data-toggle="modal" data-target="#unpinModal"><i class="fas fa-thumbtack"></i></button><button class="deleteButton" aria-label="Delete post" data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fad fa-trash"></i></button>`    
        }
		//  If not pinned
        else {
			// Add the pin button to the buttons var
            buttons = `<button class="pinButton" aria-label="Pin post" data-id="${postData._id}" data-mainPostBool="${postPageMainPost}" data-toggle="modal" data-target="#confirmPinModal"><i class="fas fa-thumbtack"></i></button><button class="deleteButton" aria-label="Delete Post" data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fad fa-trash"></i></button>`
        }
    }
	// If the post is not by the logged in user, but the logged in user is an admin:
    else if (userLoggedIn.admin) {
		//Add the delete post button
        buttons = `<button class="deleteButton" data-id="${postData._id}" data-mainPostBool="${postPageMainPost}" aria-label="Delete Post" data-toggle="modal" aria-label="Delete Post" data-target="#deletePostModal"><i class="fad fa-trash"></i></button>`
    }

	//If the post is pinned, create the text saying as such
    if(postData.pinned === true) {
        pinnedPostText = `<span style="color: rgb(101, 119, 134);"><i class="fas fa-thumbtack" style="color: rgb(101, 119, 134);"></i>&nbsp;&nbsp;Pinned<span>`
    }

	// If the post is a reshare and is pinned, the text needs to go in same place so:
    if(isReshare && postData.pinned) {
		// Set a temp var containing pinned post text
        temp = pinnedPostText;
		// Create the new pinnedposttext combining pinned text with reshare text
        pinnedPostText = pinnedPostText + '&nbsp;&nbsp;<span>|</span>&nbsp;&nbsp;' + reshareText;
		// Empty reshare text as contained in new pin message
        reshareText = '';
    }

    var boosted = postData.boosted == true;
    var boostedStyle = boosted ? "background-color: #e6feff;border-style: solid;border-width: 2px;border-color: #ff0000;border-radius: 5px;margin: 10px;" : "";

    if (boosted) {
        if (reshareText !== '') {
            temp = reshareText;
            reshareText = '<span style="color: #ff0000;"><i class="fas fa-fire"></i>&nbsp;&nbsp;<b>Boosted</b><span>&nbsp;&nbsp;<span>|</span>&nbsp;&nbsp;' + temp; 
        }
        else if (pinnedPostText !== '') {
            temp = pinnedPostText;
            pinnedPostText = '<span style="color: #ff0000;"><i class="fas fa-fire"></i>&nbsp;&nbsp;<b>Boosted</b><span>&nbsp;&nbsp;<span>|</span>&nbsp;&nbsp;' + temp;
        }
        else {
            pinnedPostText = '<span style="color: #ff0000;"><i class="fas fa-fire"></i>&nbsp;&nbsp;<b>Boosted</b><span>';
        }
        
    }

    var image = "";

	// If the post has an image
    if(postData.image) {
		// If the post also has text
        if(postData.content) {
			// Set the image var to the post image
            var image = `<div class='postImage'>
                            <img src='${postData.image}'>
                        </div>`;
        }
        else {
			// Set the image var to the post image + extra padding to account for absence of text
            var image = `<br><div class='postImage'>
                            <img src='${postData.image}'>
                        </div>`;
        }
    }

	// If the post contains code
    if(hasCode) {
		// If the post also has text
        if(postData.content) {
			// Create the codehtml var with the code content
            var codeHtml = `<pre><code>${codeContent}</code></pre>`;
        }
        else {
			// Create the codehtml var with the code content + extra spacing due to absence of text
            var codeHtml = `<br><pre><code>${codeContent}</code></pre>`;
        }
    }
    else {
		// Else set code html to be blank
        var codeHtml = ``;
    }

	// Initalise poll html var
	var pollHtml = ``;
	// If the post has a poll
	if(hasPoll) {
		// Add this poll to the poll dictionary
		addToPollDictionary(`${postData._id}`, [`${votes1.join("', '")}`], [`${votes2.join("', '")}`]);
		// If the post with the poll is not focused
		if(postPageMainPost !== 'yes') {
			// Create the poll html, stating that the post must be focused in order to view the poll
			pollHtml = `<div class="pollContainer" style="margin-top:10px;padding: 15px;padding-bottom: 0px;background-color: var(--lightGrey););border-radius: 15px;">
	  					<h1 style="font-weight:700;">Poll: ${pollTitle}</h1>
						<p style="margin-top:10px;margin-bottom:20px;padding-left:5px;">Click here to view the poll</p>
				    </div>`;
		}
		// Check this poll is in the poll dictionary
		else if (pollDictionary[`${postData._id}`].votes1.includes(userLoggedIn._id) || pollDictionary[`${postData._id}`].votes2.includes(userLoggedIn._id)) {
			
			// Check if the poll contains regular content
			if(postData.content) {
				// If it does, add spacing
				pollHtml = pollHtml + `<br>`;
			}

			// Initalise poll percentage vars
			let pollPercentage1 = 0;
			let pollPercentage2 = 0;

			// Check if either vote is 0 to avoid a division by 0 error
			if (votes1.length == 0 && votes2.length == 0) {
				pollPercentage1 = 0;
				pollPercentage2 = 0;
			}
			// If both are non zero
			else {
				// Get the percentages of the the votes
				pollPercentage1 = ((votes1.length)/(votes1.length + votes2.length))*100;
				pollPercentage2 = ((votes2.length)/(votes1.length + votes2.length))*100;
			}
			// Create the poll html with all of the previously defined variables, user has voted so show current results
			pollHtml = pollHtml + `<div class="pollContainer" style="margin-top:10px;padding: 15px;padding-bottom: 0px;background-color: var(--lightGrey););border-radius: 15px;">
										<h1 style="font-weight:700;">${pollTitle}</h1>
										<br>
										<button id="pollSelection1" data-id="${postData._id}" disabled style="width: 100%;">
											<div style="margin-left:10px;width:100%;border-radius:10px;background-color:var(--blueLight);">
	   											<p data-id="${postData._id}" style="margin-right: 10px; background-color: var(--blue); font-weight: 500; color: white; padding: 10px; width: ${pollPercentage1}%; border-radius: 10px;"><span style="display: block;margin-left: 13vw;width: 15vw;">${option1}</span></p>
	       										</div>
										</button>
										<button id="pollSelection2" data-id="${postData._id}" disabled style="width:100%;">
	  										<div style="margin-left:10px;width:100%;border-radius:10px;background-color:var(--blueLight);">
	   											<p data-id="${postData._id}" style="margin-right: 10px; background-color: var(--blue); font-weight: 500; color: white; padding: 10px; width: ${pollPercentage2}%; border-radius: 10px;"><span style="display: block;margin-left: 13vw;width: 15vw;">${option2}</span></p>
	       										</div>
										</button>
									</div>
	  
			 `;
		}
		// If the user has not yet voted on this poll
		else {
			// If content present, add spacing
			if(postData.content) {
				pollHtml = pollHtml + `<br>`;
			}
			// Create poll html, user hasn't voted yet so show the voting buttons
			pollHtml = pollHtml + `<div class="pollContainer" style="margin-top:10px;padding: 15px;padding-bottom: 0px;background-color: var(--lightGrey););border-radius: 15px;">
	  									<h1 style="font-weight:700;">${pollTitle}</h1>
										<br>
										<button id="pollSelection1" data-id="${postData._id}" style="width: 100%;">
			 								<p data-id="${postData._id}" onmouseover="this.style.backgroundColor='var(--blue)'" onmouseout="this.style.backgroundColor='var(--blueLight)'" style="margin-left: 10px; margin-right: 10px; background-color: var(--blueLight); font-weight: 500; color: white; padding: 10px; width: 100%; border-radius: 10px;">${option1}</p>
			   							</button>
										<button id="pollSelection2" data-id="${postData._id}" style="width:100%;">
											<p data-id="${postData._id}" onmouseover="this.style.backgroundColor='var(--blue)'" onmouseout="this.style.backgroundColor='var(--blueLight)'" style="margin-left: 10px; margin-right: 10px; background-color: var(--blueLight); font-weight: 500; color: white; padding: 10px; width: 100%; border-radius: 10px;">${option2}</p>
										</button>
			 						</div>
	
	     					<script>
							addToPollDictionary('${postData._id}', ['${votes1.join("', '")}'], ['${votes2.join("', '")}']);
	   					</script>
	  
	 		 `;
		}
	}

    return `<div class='post' data-id='${postData._id}' style="${boostedStyle}" data-mainPostBool="${postPageMainPost}">
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
						${pollHtml}
                        ${image}
                        <div class='postFooter' style="${LargeFontStyle}">
                            <div class='postButtonContainer'>
                                <button aria-label="Comment" data-toggle='modal' data-target='#replyModal'>
                                    <i class='fas fa-comments'></i>&nbsp;&nbsp;<span>${replyCount === 0 ? '' : replyCount}</span>
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
			    <div class='postButtonContainer blue'>
                                <button aria-label="Bookmark" style="width:75px;" class='bookmarkButton ${bookmarkButtonActiveClass}'>
                                    <i class='${bookmarkButtonFillIcon} fa-bookmark'></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

// Function to calculate worded time diff based on two epoch timestamps
function timeDifference(current, previous) {

	// Milliseconds in a minute (UNIX timestamp measured in ms)
    var msPerMinute = 60 * 1000;
	// ms per hour
    var msPerHour = msPerMinute * 60;
	// Per day
    var msPerDay = msPerHour * 24;
	// Per month
    var msPerMonth = msPerDay * 30;
	// Per year
    var msPerYear = msPerDay * 365;

	// Get the elapsed time between the timestamps
    var elapsed = current - previous;

	// If it was under a minute ago
    if (elapsed < msPerMinute) {
		// If under 30s ago, return just now
        if(elapsed/1000 < 30) return "Just now";

		// 30s - 1 min say the number of seconds ago it was
        return Math.round(elapsed/1000) + ' seconds ago';   
    }

	// If < 1 hour
    else if (elapsed < msPerHour) {
		// Return number of mins ago it was
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

	// If < 1 day
    else if (elapsed < msPerDay ) {
		// Return number of hours ago it was
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

	// If < 1 month
    else if (elapsed < msPerMonth) {
		// Return number of days ago
        return Math.round(elapsed/msPerDay) + ' days ago';   
    }

	// If < 1 year
    else if (elapsed < msPerYear) {
		// Return number of months ago
        return Math.round(elapsed/msPerMonth) + ' months ago';   
    }

	// If > 1 year
    else {
		// Return number of years ago
        return Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}

// Create array to store ads in
var ads = [];
// Add ads to array
/*ads.push(`<div class="post" data-id="65463a609b3c16b8083cbd25">
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
*/

// Function to output an array of posts to a provided container
function outputPosts(results, container) {
	// Set the minimum spacing for ads
    var adIncrement = 5;

	// Reset the container
	container.html("");

	// If the results are not in array form
	if(!Array.isArray(results)) {
		// Set them to array form
		results = [results];
	}

	// Iterate through each result
	results.forEach(result => {
		// Create the html for this result
		var html = createPostHtml(result);
		// Add the html to the end of the container
		container.append(html);
		// Ensure any code is syntax highlighted
        hljs.highlightAll();
		// Get the spacing between ads (0-4+5, ie between 5 and 9 post spacing)
        var random = Math.floor(Math.random() * 4) + 5;
		// If there is an ad due
        if (adIncrement >= random) {
			// If no ads
            if (ads.length == 0) {
				// Just reset the increment
                adIncrement = 0;
            }
			// If there are ads left
            else {
				// Get a random id for an ad
                var randomAdId = Math.floor(Math.random() * ads.length);
				// Add the selected ad
                container.append(ads[randomAdId]);
                // Remove that ad from ads
                ads.splice(randomAdId, 1);
				// Reset the ad tracker
                adIncrement = 0;
            }
        }
		// Add one to ad tracker
        adIncrement++;
	});

	// Set the tooltip data to the tooltip
	$('[data-toggle="tooltip"]').tooltip()

	// If there are no results, return as such
	if (results.length == 0) {
		container.append("<span class='noResults'>Nothing to show :(</span>");
	}

	// Iterate over each bookmark button
	$(".bookmarkButton").each(function() {
	        // Get the relevant bookmark button
			var button = $(this);
			// Get the post id from the button
	        var postId = getPostIdFromElement(button);

			// If the current post is bookmarked, update the button to reflect that
	        if (userLoggedIn.bookmarks.includes(postId)) {
	            button.addClass("active");
	            button.find("i").removeClass("far").addClass("fas");
			// If current post not bookmarked, update to reflect that
	        } else {
	            button.removeClass("active");
	            button.find("i").removeClass("fas").addClass("far");
	        }
	    });
}

// Function for outputting posts with replies
function outputPostsWithReplies(results, container) {
	// Set the container to empty to start
    container.html("");

	// If the post being replied to is deleted
    if(results.replyTo !== undefined && results.replyTo === null) {
		// Output this
        container.append("<span class='noResults'>Original post was deleted</span>")
    }
	// If replied to post still exists
    else if(results.replyTo !== undefined && results.replyTo._id !== undefined) {
		// Create html for this post
        var html = createPostHtml(results.replyTo);
		// Output this post
        container.append(html);
		// Highlight any code
        hljs.highlightAll();
    }

	// Create html for the focused post
    var mainPostHtml = createPostHtml(results.postData, true);
	// Append the main post
    container.append(mainPostHtml);
	// Highlight any code syntax
    hljs.highlightAll();

	// Iterate over each reply
    results.replies.forEach(result => {
		// Get html for this reply
        var html = createPostHtml(result);
		// Output the post to the container
        container.append(html);
		// Highlight any code syntax
        hljs.highlightAll();
    });
}

// Function to output users
function outputUsers(results, container) {
	// Start by resetting the container
	container.html("");

	// For each result
	results.forEach(result => {
		// Create html for this user
		var html = createUserHtml(result, true);
		// Add the user to the container
		container.append(html);
	});

	// If no users were supplied
	if(results.length == 0) {
		// Add the no results message to the container
		container.append(`<span class='noResults'>Nothing to show :(</span>`);
	}
}

// Function to create HTML for users
function createUserHtml(userData, showFollowButton) {

	// If last name is not set, set it to an empty string
    if(userData.lastName == null) {
        userData.lastName = "";
    }
	// If the user does not have a last name, there should be no space between first and last name as there is not a last name
    if(userData.lastName == ""){
        var nameSpace = "";
    }
	// Do the opposite if the user does have a last name
    else {
        var nameSpace = " ";
    }

	// If the follow button should be shown in this context and all other data correctly provided
	if (showFollowButton && userLoggedIn._id != userData._id) {
		// Determine whether current user following target user
		if(userLoggedIn.following && userLoggedIn.following.includes(userData._id)) {
			isFollowing = true;
		}
		else {
			isFollowing = false;
		}
		// Set the text to be used depending on whether target user is currently followed by current user or not
		text = isFollowing ? "Unfollow" : "Follow"
		// Set button class in same manner
		buttonClass = isFollowing ? "followButton following" : "followButton"
		// Set the type of icon as well
		buttonIcon = isFollowing ? "fa-user-minus" : "fa-user-plus"
		// Create the final follow text to be rendered
		followText = `<div class='followButtonContainer'><button class="${buttonClass}" data-user="${userData._id}"><i class="fas ${buttonIcon}"></i><span>${text}</span></button></div>`
	}
	else {
		// If follow text not needed in this context, set it to an empty string
		followText = "";
	}

    // If the user is verified, add the relevant badge
    var verified = userData.verified ? `<img style="padding-left:5px;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="Verified"></img>` : "";
    // Add badge for verified brand accounts
    var verifiedBrand = userData.verifiedBrand ? `<svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1.5em;padding-left:5px;vertical-align: -0.45em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg>` : "";
    // Add badge for verified govs
    var verifiedGovernment = userData.verifiedGovernment ? `<i class="fas fa-circle-check" style="padding-left:5px;color:#696969;" data-toggle="tooltip" data-placement="top" title="Government Affiliated Account"></i>` : "";

    // Verified brands should also have square profile pictures
    var squarePicture = userData.verifiedBrand ? "style='border-radius:10%;'" : "";

    // Return the user HTML with previously set information
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

// Function to search for users
function searchUsers(searchTerm) {
    // Send a get request to the users API providing the searchterm 
    $.get("/api/users", { search: searchTerm }, results => {
        // Output users returned into the results container
        outputSelectableUsers(results, $(".resultsContainer"));
    });
}

// Function to output selectable users - ie not youself or already added to group chat
function outputSelectableUsers(results, container) {
    // Empty container
	container.html("");
	
    // Iterate over each result
	results.forEach(result => {

        // If result user is already selected or is the logged in user
        if(result._id == userLoggedIn._id || selectedUsers.some(u => u._id == result._id)) {
            // Halt execution of function
            return;
        }

        // Create the user html
		var html = createUserHtml(result, false);
        // Get the element from html
        var element = $(html);
        // Set element click to user
        element.click(() => userSelected(result));
        // Append the element to the container
		container.append(element);
	});

    // If no results
	if(results.length == 0) {
        // Append the no results text
		container.append(`<span class='noResults'>Nothing to show :(</span>`);
	}
}

// Function to select user
function userSelected(user) {
    // Add user to the selected user array
    selectedUsers.push(user);
    // Run code to update the selected user html
    updateSelectedUsersHtml();
    // Empty the search textbox and focus it
    $("#userSearchTextbox").val("").focus();
    // Empty the results container
    $(".resultsContainer").html("");
    // Enable the create chat button (set disabled to false)
    $("#createChatButton").prop("disabled", false);
}

// Function to update the html of a selected user
function updateSelectedUsersHtml() {
    // Initialise element var
    var element = []

    // for each selected user
    selectedUsers.forEach(user => {
        // Start with a space betwen first and last names
        var nameSpace = " "
        // If no last name
        if(user.lastName == null){
            // Set last name to empty string
            user.lastName = "";
        }
        // If last name is empty string
        if(user.lastName == ""){
            // Remove space between names - no last name
            nameSpace = "";
        }
        // Create concatenated name
        var name = user.firstName + nameSpace + user.lastName;
        // Create user element
        var userElement = $(`<span class='selectedUser'>${name}</span>`);
        // Add the user element to the element array
        element.push(userElement);
    });

    // Remove the selected user
    $(".selectedUser").remove();
    // Add selected users to the selected users element
    $("#selectedUsers").prepend(element);
}

// Function to get chat name
function getChatName(chatData) {
    // Chat name set to supplied chataData's chat name
	var chatName = chatData.chatName;

    // If no chat name was supplied
	if(!chatName) {
        // Get the other users's names
		var otherChatUsers = getOtherChatUsers(chatData.users);
        // Create an array with the names of the users that were returned
		var namesArray = otherChatUsers.map(user => user.firstName + " " + user.lastName);
        // Update the chat name with the user#s names seperated by ", 0" 
		chatName = namesArray.join(", ");
	}

    // Return the newly generated
	return chatName;
}

// Function to get the other users in a chat
function getOtherChatUsers(users) {
    // If the users array is only containing another user, then just return that user
	if(users.length == 1) return users;

    // Return all users
	return users.filter(user => user._id != userLoggedIn._id);
}

// Function to be ran when a message is recieved
function messageReceived(newMessage) {
    // If nt on chat page
    if($(`[data-room=${newMessage.chat._id}]`).length == 0) {
        // Popup the message 
        showMessagePopup(newMessage);
    }
    // If on the chat page
    else {
        // Add the chat message html to the chat
        addChatMessageHtml(newMessage);
    }

    // Refresh the messages badge in the navbar
    refreshMessagesBadge();
}

// Function  to mark notifications as opened when clicked
function markNotificationsAsOpened(notificationId = null, callback = null) {
    // If there is no callback supplied, then use a reload as the callback
    if(callback == null) callback = () => location.reload();

    // Set the specific api request to run, if an id is provided - provide that as the particular notification to be provided.
    // If there is not an ID provided, then dont pass it, all notifications should be marked as read
    var url = notificationId != null ? `/api/notifications/${notificationId}/markAsOpened` : `/api/notifications/markAsOpened`;
    // Issue an ajax request
    $.ajax({
        // Put the url to be used
        url: url,
        // PUT request
        type: "PUT",
        // Run the callback on success
        success: () => callback()
    })
}

// Function to refresh the messages badge
function refreshMessagesBadge() {
    // Issue a get request to the chats api endpoint, specifying that only unread messages are wanted
    $.get("/api/chats", { unreadOnly: true }, (data) => {
        // Set a var containing the number of results contained
        var numResults = data.length;

        // IF there are more than 0 results
        if(numResults > 0) {
            // Add the number to the badge and make it visible
            $("#messagesBadge").text(numResults).addClass("active");
        }
        else {
            // Remove any text and make it invisibile
            $("#messagesBadge").text("").removeClass("active");
        }
    })
}

// Function to refresh the notifications bade
function refreshNotificationsBadge() {
    // Issue a get request to the notifications endpoint, only requesting unread notifications
    $.get("/api/notifications", { unreadOnly: true }, (data) => {
        // Set a var with the length of the results
        var numResults = data.length;

        // If more than zero results
        if(numResults > 0) {
            // Set the notificatins badge text to the number of results and make it visible
            $("#notificationsBadge").text(numResults).addClass("active");
        }
        else {
            // Remove text from badge and make it invisible
            $("#notificationsBadge").text("").removeClass("active");
        }
    })
}

// Function to create the chat html
function createChatHtml(chatData) {
    // Get the chat name and save to a var
	var chatName = getChatName(chatData);
    // Get the chat image and save as var
	var image = getChatImageElements(chatData);

    // Get and save the latest chat message to a var
	var latestMessage = getLatestMessage(chatData.latestMessage);

    // Set whether the chat should be highlighted - this is when there are unread messages in the chat
  	var activeClass = !chatData.latestMessage || chatData.latestMessage.readBy.includes(userLoggedIn._id) ? "" : "active";

    // Return the chat html with the previously defined variables
	return `<a href='/messages/${chatData._id}' class='resultListItem ${activeClass}'>
				${image}
				<div class='resultsDetailsContainer ellipsis'>
					<span class='heading ellipsis'>${chatName}</span>
					<span class='subText ellipsis'>${latestMessage}</span>
				</div>
			</a>`
}

// Get the latest message in the chat
function getLatestMessage(latestMessage) {
    // If there is a latest message
	if(latestMessage != null) {
        // Store the sender of the latest message in a var
		var sender = latestMessage.sender;
        // Initialise a sender name variable
		let senderName = "";

        // If there is no last name
		if (sender.lastName == "") {
            // Set the sender name to just the senders first name
			senderName = `${sender.firstName}`;
		}
		else {
            // Set the sender name to both first and last name, seperated with a space.
			senderName = `${sender.firstName} ${sender.lastName}`;
		}

        // If there is content
		if (latestMessage.content !== undefined) {
            // Return the senders name with the message content
			return `${senderName}: ${latestMessage.content}`;
		}
        // If there is not content, then it is an image message
		else if (latestMessage.imageMessage !== undefined) {
            // Return the senders name as well as noting that it is an image message
			return `${senderName}: Image Message`;
		}
	}

    // Else, if there are no messages, return that it is a new chat.
	return "New chat";
}

// Function to create the chat image - it uses profile images of people in the chat
function getChatImageElements(chatData) {
    // Get other users in the chat and store it as a var
	var otherChatUsers = getOtherChatUsers(chatData.users);
    // Initalise the groupchatclass var
	var groupChatClass = "";
    // Set the first chat image
	var chatImage = getUserChatImageElement(otherChatUsers[0]);

    // If there is more than 1 users
	if(otherChatUsers.length > 1) {
        // Set that it is a groupchat
		groupChatClass = "groupChatImage";
        // Add a second user image
		chatImage += getUserChatImageElement(otherChatUsers[1]);
	}

    // Return the chat image
	return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`
}

// Function to get users image from user element passed in
function getUserChatImageElement(user) {
    // If no user passed or the user does not have a profile image
	if(!user || !user.profilePic) {
        // Return an alert letting the user know that somehing went wrong
		return alert("User passed into function is invalid");
	}

    // Return the user's profile picture, also adding alt text for accessability
	return `<img src='${user.profilePic}' alt="User's profile pic">`
}

// FUnction to show notification popup
function showNotificationPopup(data) {
    // Create html for the notification
    var html = createBasicNotificationHtml(data);
    // Create an element
    var element = $(html);

    // Hide the element, add it to the notification list element and begin the slide down animation
    element.hide().prependTo("#notificationList").slideDown("fast");

    // Set the notification to fadeout after 4 seconds.
    setTimeout(() => element.fadeOut(400), 5000);
}

// Function to show message popup
function showMessagePopup(data) {

    // If there is no latestest message
    if(!data.chat.latestMessage._id) {
        // Set the latest message to data
        data.chat.latestMessage = data;
    }

    // Create the message html
    var html = createChatHtml(data.chat);
    // Create the element
    var element = $(html);

    // Hide element, prepend to notification list, begin animation
    element.hide().prependTo("#notificationList").slideDown("fast");

    // Fadeout after 5 seconds
    setTimeout(() => element.fadeOut(400), 5000);
}

// Function to output the basic notifications list
function outputBasicNotificationsList(notifications, container,) {
	// Initialise increment var
    var increment = 0;
    // Iterate through each notifiction
	for (const notification of notifications) {
        // CReate html for notifications 
		var html =  createBasicNotificationHtml(notification, increment);
        // Add html to the container
		container.append(html);
        // Increase the increment
		increment++;
	}

    // If there are no notifcations
	if (notifications.length == 0) {
        // Set the message saying no results with a little joke at the end as well
		container.append("<span class='noResults'>No notifications? It's almost as if your phone is trying to tell you something.</span>");
	}
}

// Function to create notification html
function createBasicNotificationHtml(notification, increment) {
    // Create var with user from
	var userFrom = notification.userFrom;
    // Get notification text
	var text = getBasicNotificationText(notification);
    // Get notification url
	var url = getBasicNotificationUrl(notification);
    // Choose whether to highlight the notification based on if the notification has been opened or not
	var className = notification.opened ? "" : "active";

    // Return the notification html with the variables previously set
	return `<a href="${url}" class="resultListItem notification ${className}" data-id="${notification._id}">
				<div class="resultsImageContainer">
					<img src="${userFrom.profilePic}">
				</div>
				<div id="${increment}" class="resultsDetailsContainer ellipsis">
					<span style="font-weight:500;" class="ellipsis">${text}</span>
				</div>
			</a>`;
}

// Function get the notification text
function getBasicNotificationText(notification) {
    // Set a var with the userfrom
	var userFrom = notification.userFrom;

    // Testing verification badge
	//var verified = userFrom.verified ? `<img style="height: 1.5em;padding-left:0px;vertical-align: -0.45em;filter: invert(44%) sepia(91%) saturate(1231%) hue-rotate(185deg) brightness(106%) contrast(101%);" src="/images/badge-check.svg" data-toggle="tooltip" data-placement="top" title="Verified"></img>` : "";
    // Verified brand badge
	var verifiedBrand = userFrom.verifiedBrand ? `<svg viewBox="0 0 22 22" data-toggle="tooltip" data-placement="top" title="" data-original-title="Verified Brand" style="height: 1.5em;padding-left:0px;vertical-align: -0.45em;"><rect width="10" height="10" x="6" y="6" fill="#000000"></rect><g><linearGradient id="12-a" gradientUnits="userSpaceOnUse" x1="4.411" x2="18.083" y1="2.495" y2="21.508"><stop offset="0" stop-color="#f4e72a"></stop><stop offset=".539" stop-color="#cd8105"></stop><stop offset=".68" stop-color="#cb7b00"></stop><stop offset="1" stop-color="#f4ec26"></stop><stop offset="1" stop-color="#f4e72a"></stop></linearGradient><linearGradient id="12-b" gradientUnits="userSpaceOnUse" x1="5.355" x2="16.361" y1="3.395" y2="19.133"><stop offset="0" stop-color="#f9e87f"></stop><stop offset=".406" stop-color="#e2b719"></stop><stop offset=".989" stop-color="#e2b719"></stop></linearGradient><g clip-rule="evenodd" fill-rule="evenodd"><path d="M13.324 3.848L11 1.6 8.676 3.848l-3.201-.453-.559 3.184L2.06 8.095 3.48 11l-1.42 2.904 2.856 1.516.559 3.184 3.201-.452L11 20.4l2.324-2.248 3.201.452.559-3.184 2.856-1.516L18.52 11l1.42-2.905-2.856-1.516-.559-3.184zm-7.09 7.575l3.428 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-a)"></path><path d="M13.101 4.533L11 2.5 8.899 4.533l-2.895-.41-.505 2.88-2.583 1.37L4.2 11l-1.284 2.627 2.583 1.37.505 2.88 2.895-.41L11 19.5l2.101-2.033 2.895.41.505-2.88 2.583-1.37L17.8 11l1.284-2.627-2.583-1.37-.505-2.88zm-6.868 6.89l3.429 3.428 5.683-6.206-1.347-1.247-4.4 4.795-2.072-2.072z" fill="url(#12-b)"></path><path d="M6.233 11.423l3.429 3.428 5.65-6.17.038-.033-.005 1.398-5.683 6.206-3.429-3.429-.003-1.405.005.003z" fill="#d18800"></path></g></g></svg>` : "";
	
    // Add verified brand suffix
	var suffixes = verifiedBrand;

    // If there is no user from variable
	if(!userFrom.firstName) {
        // Return an error alerting the user
		return alert("user from data not populated");
	}

    // If user has no last name
	if (userFrom.lastName == "") {
        // Set the userfromname to be just the first name
		var userFromName = userFrom.firstName;
	}
	else {
        // Set the userfromname to be the firstname and lastname seperated with a space
		var userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
	}

    // Initialise the text variable
	var text;

    // If it is a reshare, set the relevant text
	if(notification.notificationType == "postReshare") {
		text = `${userFromName}${suffixes}  reshared one of your posts`;
	}
    // Set relevant like text
	else if (notification.notificationType == "postLike") {
		text = `${userFromName}${suffixes}  liked one of your posts`;
	}
    // Set relevant reply text
	else if (notification.notificationType == "reply") {
		text = `${userFromName}${suffixes}  replied to one of your posts`;
	}
    // Set relevant follow text
	else if (notification.notificationType == "follow") {
		text = `${userFromName}${suffixes}  followed you`;
	}

    // Return the definded text
	return `<span class="ellipsis">${text}</span>`;
}

// Functio to get the url for notifications
function getBasicNotificationUrl(notification) {
    // Initialise the url variable (# just represents a refresh)
	var url = "#";

    // If it is a reshare, like, or reply
	if(notification.notificationType == "postReshare" || notification.notificationType == "postLike" || notification.notificationType == "reply") {
        // Set the url to the relevant post
		url = `/post/${notification.entityId}`;
	}
    // If it is a follow
	else if (notification.notificationType == "follow") {
        // Set the url to the relevant profile
		url = `/profile/${notification.entityId}`;
	}

    // Return the defined url
	return url;
}

// Function to be ran when the user clicks on the change bio button
$("#changeBioButton").click(() => {
    // Send an ajax request
	$.ajax({
        // Send to the bio settings api request
		url: "/api/settings/bio/",
        // PUT request type
		type: "PUT",
        // Send the bio textbox value
		data: { bio: $("#bioTextbox").val() },
        // On success
		success: (data, status, xhr) => {
            // Redirect to profile page
			window.location.href = "/profile";
		},
        // On error
		error: (xhr, status, error) => {
            // Append the error message
			$(".errorMessageBio").text("An error occured.");
			$(".errorMessageBio").append("<br>");
		}
	});
});
