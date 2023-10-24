$("#changeNameButton").click(() => {
	$.ajax({
		url: "/api/settings/name/",
		type: "PUT",
		data: { firstName: $("#firstNameTextbox").val(), lastName: $("#lastNameTextbox").val() },
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
		data: { username: $("#changeUsernameTextbox").val() },
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

$("#changeEmailButton").click(() => {
	$.ajax({
		url: "/api/settings/email/",
		type: "PUT",
		data: { email: $("#emailTextbox").val() },
		success: (data, status, xhr) => {
			window.location.href = "/profile";
		},
		error: (xhr, status, error) => {
			if (xhr.status == 400) {
				$(".errorMessageEmail").text("Please enter an email.");
				$(".errorMessageEmail").append("<br>");
			}
			else if (xhr.status == 406) {
				$(".errorMessageEmail").text("That email is invalid.");
				$(".errorMessageEmail").append("<br>");
			}
			else if (xhr.status == 409) {
				$(".errorMessageEmail").text("That email is already taken.");
				$(".errorMessageEmail").append("<br>");
			}
		}
	});
});