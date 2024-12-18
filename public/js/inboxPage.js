// When the page loads
$(document).ready(() => {
	// Send a get request to the chats api endpoint
	$.get("/api/chats", (data, status, xhr) => {
		// If there is a 400 error codem output a corresponding messgae
		if(xhr.status == 400) {
			alert("Could not get chat list.");
		} else {
			// Output the list of chats
			outputChatList(data, $(".resultsContainer"));
		}
	})
	// Set the message button icon to be solid
	$("#messageButtonIcon").removeClass("far").addClass("fas");
})

// Function to render the chatlist given the container and the chatlist
function outputChatList(chatList, container) {
	// For each chat in the chatlist
	chatList.forEach(chat => {
		// Get the html
		var html = createChatHtml(chat);
		// Append the html to the container
		container.append(html);
	})
	
	// If there are no chats output a relevant message
	if(chatList.length == 0) {
		container.append("<span class='noResults'>Nothing to show, create a chat using the button in the top right.</span>")
	}
}
