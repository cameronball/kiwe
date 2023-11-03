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

$("#changePasswordButton").click(() => {
	$.ajax({
		url: "/api/settings/password/",
		type: "PUT",
		data: { oldPassword: $("#oldPasswordTextbox").val(), newPassword: $("#newPasswordTextbox").val(), confirmPassword: $("#confirmPasswordTextbox").val() },
		success: (data, status, xhr) => {
			window.location.href = "/logout";
		},
		error: (xhr, status, error) => {
			if (xhr.status == 401) {
				$(".errorMessagePassword").text("Password incorrect.");
				$(".errorMessagePassword").append("<br>");
			}
			else if (xhr.status == 404) {
				$(".errorMessagePassword").text("User not found, try logging out and back in.");
				$(".errorMessagePassword").append("<br>");
			}
			else if (xhr.status == 400) {
				$(".errorMessagePassword").text("Please fill out all the fields. If you don't know your old password, log out and click 'Forgot password'.");
				$(".errorMessagePassword").append("<br>");
			}
			else if (xhr.status == 409) {
				$(".errorMessagePassword").text("Passwords do not match.");
				$(".errorMessagePassword").append("<br>");
			}
		}
	});
});

$("#deleteAccountButton").click(() => {
	$.ajax({
		url: "/api/settings/delete/",
		type: "DELETE",
		data: { password: $("#deleteAccountPasswordTextbox").val() },
		success: (data, status, xhr) => {
			window.location.href = "/logout";
		},
		error: (xhr, status, error) => {
			if (xhr.status == 401) {
				$(".errorMessageDelete").text("Password incorrect.");
				$(".errorMessageDelete").append("<br>");
			}
			else if (xhr.status == 404) {
				$(".errorMessageDelete").text("User not found, try logging out and back in.");
				$(".errorMessageDelete").append("<br>");
			}
			else if (xhr.status == 400) {
				$(".errorMessageDelete").text("Please fill out all the fields. If you don't know your password, log out and click 'Forgot password'.");
				$(".errorMessageDelete").append("<br>");
			}
		}
	});
});

$(document).ready(() => {
	$("#settingsButtonIcon").removeClass("far").addClass("fas");
})
