$(document).ready(() => {
	$.get("/api/chats", (data, status, xhr) => {
		if(xhr.status == 400) {
			alert("Could not get chat list.");
		} else {
			outputChatList(data, $(".resultsContainer"));
		}
	})
	$("#messageButtonIcon").removeClass("far").addClass("fas");
})

function outputChatList(chatList, container) {
	chatList.forEach(chat => {
		var html = createChatHtml(chat);
		container.append(html);
	})
	
	if(chatList.length == 0) {
		container.append("<span class='noResults'>Nothing to show, create a chat using the button in the top right.</span>")
	}
}
