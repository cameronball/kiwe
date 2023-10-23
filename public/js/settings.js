$("#changeUsernameButton").click(() => {
	$.ajax({
		url: "/api/settings/username/",
		type: "PUT",
		data: { username: $("#changeUsernameTextbox").val(), id: userLoggedIn._id },
		success: (data, status, xhr) => {
			// Send user to the /logout route
			window.location.href = "/logout";
		},
		error: (xhr, status, error) => {
			if (xhr.status == 400) {
				$(".errorMessage").text("Please enter a username.");
				$(".errorMessage").append("<br>");
			}
			else if (xhr.status == 409) {
				$(".errorMessage").text("That username is already taken.");
				$(".errorMessage").append("<br>");
			}
		}
	});
});