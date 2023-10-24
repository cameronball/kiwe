$("#changeNameButton").click(() => {
	$.ajax({
		url: "/api/settings/name/",
		type: "PUT",
		data: { firstName: $("#firstNameTextbox").val(), lastName: $("#lastNameTextbox").val()},
		success: (data, status, xhr) => {
			window.location.href = "/profile";
		},
		error: (xhr, status, error) => {
			if (xhr.status == 400) {
				$(".errorMessageName").text("Please enter a first name.");
				$(".errorMessageName").append("<br>");
			}
		}
	});
});

$("#changeUsernameButton").click(() => {
	$.ajax({
		url: "/api/settings/username/",
		type: "PUT",
		data: { username: $("#changeUsernameTextbox").val(), id: userLoggedIn._id },
		success: (data, status, xhr) => {
			window.location.href = "/profile";
		},
		error: (xhr, status, error) => {
			if (xhr.status == 400) {
				$(".errorMessageUsername").text("Please enter a username.");
				$(".errorMessageUsername").append("<br>");
			}
			else if (xhr.status == 409) {
				$(".errorMessageUsername").text("That username is already taken.");
				$(".errorMessageUsername").append("<br>");
			}
		}
	});
});