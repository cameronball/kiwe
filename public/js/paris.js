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
	})
}
