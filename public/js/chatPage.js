// Initalise the typing var, beginning at false
var typing = false;
// Initalise last typing time var
var lastTypingTime;

// On page load
$(document).ready(() => {

	// Join the chat room
	socket.emit("join room", chatId);
	// When typing event recived, show the typing indicator
	socket.on("typing", () => $(".typingDots").show());
	// When no longer recieving typing event, hide the typing indicator
	socket.on("stop typing", () => $(".typingDots").hide());

	// Send a get api request to the chats endpoint passing this chat id
	$.get(`/api/chats/${chatId}`, (data) => {
		// Set the chat name to the chats name
		$("#chatName").text(getChatName(data));
	})

	// Send an api get request to the messages endpoint of this chat
	$.get(`/api/chats/${chatId}/messages`, (data) => {
		// Init a message array
		var messages = [];
		// Init a lastSenderId var as an empty string
		var lastSenderId = "";

		// For each message
		data.forEach((message, index) => {
			// Create the message html
			var html = createMessageHtml(message, data[index + 1], lastSenderId);
			// Add the html to the messages array
			messages.push(html);

			// Set the last sender id
			lastSenderId = message.sender._id;
		});

		// COmbine array elements into a single string
		var messagesHtml = messages.join("");
		// Add the html of the messages to the page
		addMessagesHtmlToPage(messagesHtml);
		// Mark the messages in this chat as read
		markAllMessagesAsRead();

		// Messages loaded
		// Remove the loading spinner
		$(".loadingSpinnerContainer").remove();
		// Make the chat container visible
		$(".chatContainer").css("visibility", "visible");
		// Get all images
		var images = document.querySelectorAll('.chatContainer img');

		// Get the number of images
		var numImages = images.length;
		var imagesLoaded = 0;
	
		// For each image
		images.forEach(image => {
			// Once it has loaded
		    image.onload = () => {
			imagesLoaded++;
	
			if (imagesLoaded === numImages) {
				// Scroll to the bottom - images load after text so needs to scroll to bottom again
			    scrollToBottom(false);
			}
		    };
		});
	})
	// Make the messages navbar icon solid
	$("#messageButtonIcon").removeClass("far").addClass("fas");
});

// Code to be ran when the chat name button is clicked
$("#chatNameButton").click(() => {
	// Get the name
	var name = $("#chatNameTextbox").val().trim();
	
	// Issue an ajax request
	$.ajax({
		url: "/api/chats/" + chatId,
		type: "PUT",
		data: { chatName: name},
		success: (data, status, xhr) => {
			if(xhr.status != 204) {
				alert("Could not update");
			} else {
				location.reload();
			}
		}
	})
});

// Submit message when the send message button is clicked
$(".sendMessageButton").click(() => {
	messageSubmitted();
});

// When the user presses a key in the input textbox, this function should be ran
$(".inputTextbox").keydown((event) => {

	// Run the update typing function
	updateTyping();

	// If the enter key (13) is pressed without the shift key
	if(event.which === 13 && !event.shiftKey) {
		// Submit the messgae
		messageSubmitted();
		// Halt Execution
		return false
	}
});

// Function to update typing status
function updateTyping() {
	// If not connected to the server then halt execution
	if(!connected) return;

	// If not already typing
	if(!typing) {
		// Set typing to true
		typing = true;
		// Send this evemt to the server
		socket.emit("typing", chatId);
	}

	// Get the time currently and set it to the last typing time
	lastTypingTime = new Date().getTime();
	// The user must send a message every 2 seconds for the typing indicator to remain
	var timerLength = 2000;

	// Set a delayed function
	setTimeout(() => {
		// Get the current time
		var timeNow = new Date().getTime();
		// Get the time difference
		var timeDiff = timeNow - lastTypingTime;

		// If it has been more than 2 seconds and the typing indicator is currently active
		if(timeDiff >= timerLength && typing) {
			// Send the stop typing signal to the server
			socket.emit("stop typing", chatId);
			// Set var to false
			typing = false;
		}
		// Run this function after 2 seconds
	}, timerLength);
}

// Add the message html to the page
function addMessagesHtmlToPage(html) {
	// Append to the chat messages container
	$(".chatMessages").append(html);
	// Scroll to the bottom of the container
	scrollToBottom(false);
}

// Function to submit a message
function messageSubmitted() {
	// Get the content of the message to be sent, removing any whitespace that may be present
	var content = $(".inputTextbox").val().trim();

	// If there is content
	if(content != "") {
		// Run the send message function
		sendMessage(content);
		// Empty the input textbox
		$(".inputTextbox").val("");
		// Send stop typing signal to the server
		socket.emit("stop typing", chatId);
		// Stop typing
		typing = false;
	}
}

// Function to send a message
function sendMessage(content) {
	// Issue a post request to the messages api endpoint with the chatId and the content
	$.post("/api/messages", { content: content, chatId: chatId }, (data, status, xhr) => {
		// If not successful, output error message and restore message to the input textbox
		if(xhr.status != 201) {
			alert("Could not send message");
			$(".inputTextbox").val(content);
			return;
		}

		// Add the html to the chat
		addChatMessageHtml(data);

		// If connected to the server, send a message sending the new message
		if(connected) {
			socket.emit("new message", data);
		}

	})
}

// Function to add chat message html to page
function addChatMessageHtml(message) {
	// Make sure the message is valid
	if(!message || !message._id) {
		// Alert the user if it is not
		alert("Message is not valid");
		// Halt execution
		return;
	}

	// Create message html
	var messageDiv = createMessageHtml(message, null, "");
	// Add the message to the page
	addMessagesHtmlToPage(messageDiv);
	// Scroll to the bottom
	scrollToBottom(true);
}

// Function to create the message html
function createMessageHtml(message, nextMessage, lastSenderId) {

	// Set the sender variable to the message sender
	var sender = message.sender;

	// Set the sender name based on if the user has a last name - ie whether to include a space or not
	if (sender.lastName == "") {
		senderName = sender.firstName;
	}
	else {
		senderName = sender.firstName + " " + sender.lastName;
	}

	// Set id info
	var currentSenderId = sender._id;
	var nextSenderId = nextMessage != null ? nextMessage.sender._id : "";

	// Set whether this is first/last message in a chain from same person
	var isFirst = lastSenderId != currentSenderId;
	var isLast = nextSenderId != currentSenderId;

	// Set whether the message is from the current user
	var isMine = message.sender._id == userLoggedIn._id;
	// Set the relevant class
	var liClassName = isMine ? "mine" : "theirs";

	// Init name element var as empty string
	var nameElement = "";
	// If first in chain add relevant info
	if(isFirst) {
		liClassName += " first";

		// If not from current user, output who from
		if(!isMine) {
			nameElement = `<span class='senderName'>${senderName}</span>`;
		}
	}

	// Init profile image
	var profileImage = "";
	// If last message in chain, add relevnt class and attack the senders picture
	if(isLast) {
		liClassName += " last";
		profileImage = `<img src='${sender.profilePic}'>`;
	}

	// Init the image container
	var imageContainer = "";
	// If not the current user output the previously attatched profile image
	if(!isMine) {
		imageContainer = `<div class='imageContainer'>
							${profileImage}
						</div>`;
	}

	// If it is an image message, set the message content to be the source for the image
	if (!message.content && message.imageMessage != undefined) {
		var messageContent = `<img src=${message.imageMessage}></img>`;
	}
	else {
		// Otherwise, the message comtent should just be the plain message conten
		var messageContent = message.content;
	}

	// Return the final message
	return `<li class='message ${liClassName}'>
		${imageContainer}
		<div class='messageContainer'>
			${nameElement}
			<span class='messageBody'>
				${messageContent}
			</span>
		</div>
	</li>`
}

// Function to scroll to the bottom of the chat container
function scrollToBottom(animated) {
	// Set the container
	var container = $(".chatMessages");
	// Get the height of the container
	var scrollHeight = container[0].scrollHeight;

	// If the animated flag is true
	if(animated) {
		// Animate a scroll to the bottom of the container
		container.animate({ scrollTop: scrollHeight }, "slow");
	}
	else {
		// GO straight to the bottom of the container
		container.scrollTop(scrollHeight);
	}
}

// Function to mark all messages as read
function markAllMessagesAsRead() {
	// Issue an ajax request
	$.ajax({
		// Send it to the mark as read endpoint
		url: `/api/chats/${chatId}/messages/markAsRead`,
		type: "PUT",
		// On success, refresh the messages badge
		success: () => refreshMessagesBadge()
	})
}
