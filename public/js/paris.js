$(document).ready(() => {
	var parisHistory = JSON.parse(localStorage.getItem("parisHistory"));
	if (parisHistory == null) {
		localStorage.setItem("parisHistory", JSON.stringify(
			[{
				role: "user",
				parts: [{ text: "Hello" }],
			},
			 {
				 role: "model",
				 parts: [{ text: "Hi! I am Paris, your personal assistant here on Kiwe. What would you like to know or talk about today?" }],
			 },
			]
		));
	}

	parisHistory.slice(1).forEach(item => {
		  if (item.role == "model") {
		      let model=true;
		  }
		  else {
		      let model=false;
		  }
		  addChatMessageHtml(item.parts[0].text, model);
	});
});

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
	addChatMessageHtml(content, false);
	$.get("/api/messages/paris", { message: content }, (data, status, xhr) => {
		parisHistory.push({role: 'user', parts: [{ text: content }] });
		addChatMessageHtml(data.response.candidates[0].content.parts[0].text, true);
		parisHistory.push({role: 'model', parts: [{ text: data.response.candidates[0].content.parts[0].text }] });
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
