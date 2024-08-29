$(".sendMessageButton").click(() => {
	messageSubmitted();
});

$(".inputTextbox").keydown((event) => {

	if(event.which === 13 && !event.shiftKey) {
		messageSubmitted();
		return false
	}
});

function messageSubmitted() {
	var content = $(".inputTextbox").val().trim();

	if(content != "") {
		sendMessage(content);
		$(".inputTextbox").val("");
	}
}

function sendMessage(content) {
	$.get("/api/messages/paris", { message: content }, (data, status, xhr) => {
		console.log(data);
                addChatMessageHtml(content, false);
		addChatMessageHtml(data.response.candidates[0].content.parts[0].text, true);
	})
}

function addChatMessageHtml(message, model) {
	var messageDiv = createMessageHtml(message, model);
	addMessagesHtmlToPage(messageDiv);
}

function addMessagesHtmlToPage(html) {
	$(".chatMessages").append(html);
}

function createMessageHtml(message, model) {

	if (model === true) {
		senderName = "Paris"
	}
	else {
		senderName = "You"
	}

	var liClassName = model ? "theirs" : "mine";

	liClassName += " first";

	if(model) {
		nameElement = `<span class='senderName'>${senderName}</span>`;
	}
	else {
		nameElement = "";
	}

	var profileImage = "";
	liClassName += " last";
	if (model) {
		profileImage = "/images/profilePic.jpeg";
	}
	else {
		profileImage = userLoggedIn.profilePic;
	}
	profileImage = `<img src='${profileImage}'>`;

	var imageContainer = "";
	if(model) {
		imageContainer = `<div class='imageContainer'>
							${profileImage}
						</div>`;
	}
	
	var messageContent = message;

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
