// Init the parisHistory var
var parisHistory = null;

// On page load
$(document).ready(() => {
	// Parse local storage version of paris history
	parisHistory = JSON.parse(localStorage.getItem("parisHistory"));
	// If no history
	if (parisHistory == null) {
		// Create initial message
		localStorage.setItem("parisHistory", JSON.stringify(
			[{
				role: "user",
				parts: [{ text: "Hello" }],
				display: 'false',
			},
			 {
				 role: "model",
				 parts: [{ text: `Hi ${userLoggedIn.firstName}! I am Paris, your personal assistant here on Kiwe. I can help you with various things, such as searching for posts, giving you stats about the site or updating your bio! What would you like to know or talk about today?` }],
				 display: 'true',
			 },
			]
		));
		// Reparse with initial messages added
		parisHistory = JSON.parse(localStorage.getItem("parisHistory"));
	}

	// For each chat item in the logs
	parisHistory.forEach(item => {
		// If the chat isn't meant to be displayed (Like function calls) then end execution
		  if (item.display == 'false') {
			  return
		  }
		  else {
			// Init model
			  let model = null;
			  // Define model var
			  if (item.role == "model") {
			      model=true;
			  }
			  else {
			      model=false;
			  }
			  // Add chat message html with whether it was from user or ai model
			  addChatMessageHtml(item.parts[0].text, model);
		  }
	});
});

// When send message button is clicked, submit the message
$(".sendMessageButton").click(() => {
	messageSubmitted();
});

// When the reset chat button is clicked, reset the logs and then reload the page
$(".startNewChatButton").click(() => {
	localStorage.removeItem("parisHistory");
	location.reload();
});

// To be ran whent he input textbox has a keydown event
$(".inputTextbox").keydown((event) => {
	// If it is an enter key (13) and shift is not clicked
	if(event.which === 13 && !event.shiftKey) {
		// Submit the message
		messageSubmitted();
		// Halt execution
		return false
	}
});

// When message submitted
function messageSubmitted() {
	// Extract content minus whitespace
	var content = $(".inputTextbox").val().trim();

	// If there is some content
	if(content != "") {
		// Send the message
		sendMessage(content);
		// Empty the textbox
		$(".inputTextbox").val("");
	}
}

// Function to send a message
function sendMessage(content) {
	// Add the chat message
	addChatMessageHtml(content, false);
	// Scroll to the end
	scrollDown();
	// Add a loading indicator whilst the model generates a response
	$(".chatMessages").append(`<li class="message theirs first last" id="typingIndicator">
		<div style="height:50px;width:50px;" class="imageContainer">
							<img src="/images/paris.png">
						</div>
		<div class="messageContainer">
			<span class="senderName">Paris</span>
<div class="typingDots" style="height:50px;padding-left:0px;display:block;"> <img src="/images/dots.gif" alt="Typing..."></div>
			
		</div>
	</li>`);
	// Scroll down again
	scrollDown();
	// Send a get request to the paris api endpoint
	$.get("/api/messages/paris", { message: content, parisHistory: parisHistory }, (data, status, xhr) => {
		// If no function is called, add the response to the history
		if (!data.functionCalled) {
			parisHistory.push({role: 'user', parts: [{ text: content }], display: 'true' });
			localStorage.setItem("parisHistory", JSON.stringify(parisHistory));
		}
		else {
			// Set the logs to returned logs
			localStorage.setItem("parisHistory", JSON.stringify(data.parisHistory));
			// Set the local history to be parallel
			parisHistory = JSON.parse(localStorage.getItem("parisHistory"));
		}
		// Add the chat message html
		addChatMessageHtml(data.response.candidates[0].content.parts[0].text.replace(/\*/g, "").replace(/\n+$/, ''), true);
		// Scroll down
		scrollDown();
		// Remove the typing indicator
		$('#typingIndicator').remove();
		// Push the reponse
		parisHistory.push({role: 'model', parts: [{ text: data.response.candidates[0].content.parts[0].text.replace(/\*/g, "").replace(/\n+$/, '') }], display: data.display });
		// Add the logs to local storage
		localStorage.setItem("parisHistory", JSON.stringify(parisHistory));
	});
}

// Function to scroll down
function scrollDown() {
    // Select the UL element with the class 'chatMessages'
    const chatMessages = document.querySelector('.chatMessages');

    if (chatMessages) {
        // Scroll to the bottom by setting scrollTop to the scrollHeight
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
        console.error('Element with class "chatMessages" not found.');
    }
}

// Function to add chat message html
function addChatMessageHtml(message, model) {
	// CReate HTML
	var messageDiv = createMessageHtml(message, model);
	// Add to page
	addMessagesHtmlToPage(messageDiv);
}

// Function to add to page
function addMessagesHtmlToPage(html) {
	// Append to the container
	$(".chatMessages").append(html);
}

// Function to craete message html
function createMessageHtml(message, model) {

	// Set sender name
	if (model === true) {
		senderName = "Paris"
	}
	else {
		senderName = "You"
	}

	// Remove non-standard characters
	message = message.replace(/\n/g, "<br>");

	// Add correct classes
	var liClassName = model ? "theirs" : "mine";

	liClassName += " first";

	// Set name if from model
	if(model) {
		nameElement = `<span class='senderName'>${senderName}</span>`;
	}
	else {
		nameElement = "";
	}

	// Add correct profile image
	var profileImage = "";
	liClassName += " last";
	if (model) {
		profileImage = "/images/paris.png";
	}
	else {
		profileImage = userLoggedIn.profilePic;
	}
	profileImage = `<img src='${profileImage}'>`;

	var imageContainer = "";
	if(model) {
		imageContainer = `<div style="height:50px;width:50px;" class='imageContainer'>
							${profileImage}
						</div>`;
	}
	
	// Set message content
	var messageContent = message;

	// Return message html
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
