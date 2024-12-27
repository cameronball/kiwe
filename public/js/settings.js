// Code to be ran when the user clicks on the change name button
$("#changeNameButton").click(() => {
	// Send an ajax request
	$.ajax({
		// Send to the name settings api route
		url: "/api/settings/name/",
		// Request type of PUT
		type: "PUT",
		// Send the first and last name text box values
		data: { firstName: $("#firstNameTextbox").val(), lastName: $("#lastNameTextbox").val() },
		// On success
		success: (data, status, xhr) => {
			// Redirect the user to the profile page
			window.location.href = "/profile";
		},
		// On error
		error: (xhr, status, error) => {
			// If a 400 error is returned
			if (xhr.status == 400) {
				// Set the error message to say that the first name must be entered
				$(".errorMessageName").text("Please enter a first name.");
				// Add a line break
				$(".errorMessageName").append("<br>");
			}
		}
	});
});

// Code to be ran when the user clicks on the change username button
$("#changeUsernameButton").click(() => {
	// Send an ajax request
	$.ajax({
		// Send to the username settings api route
		url: "/api/settings/username/",
		// Request type of PUT
		type: "PUT",
		// Send the username textbox value
		data: { username: $("#changeUsernameTextbox").val() },
		// On success
		success: (data, status, xhr) => {
			// Redirect the user to the profile page
			window.location.href = "/profile";
		},
		// On error
		error: (xhr, status, error) => {
			// If a 400 error is returned
			if (xhr.status == 400) {
				// Set the error message to say that the username must be entered
				$(".errorMessageUsername").text("Please enter a username.");
				// Add a line break
				$(".errorMessageUsername").append("<br>");
			}
			// If a 409 error is returned
			else if (xhr.status == 409) {
				// Set the error message to say that the username is already taken
				$(".errorMessageUsername").text("That username is already taken.");
				// Add a line break
				$(".errorMessageUsername").append("<br>");
			}
		}
	});
});

// Code to be ran when the user clicks on the change email button
$("#changeEmailButton").click(() => {
	// Send an ajax request
	$.ajax({
		// Send to the email settings api route
		url: "/api/settings/email/",
		// Request type of PUT
		type: "PUT",
		// Send the email textbox value
		data: { email: $("#emailTextbox").val() },
		// On success
		success: (data, status, xhr) => {
			// Redirect the user to the profile page
			window.location.href = "/profile";
		},
		// On error
		error: (xhr, status, error) => {
			// If a 400 error is returned
			if (xhr.status == 400) {
				// Set the error message to say that the email must be entered
				$(".errorMessageEmail").text("Please enter an email.");
				// Add a line break
				$(".errorMessageEmail").append("<br>");
			}
			// If a 406 error is returned
			else if (xhr.status == 406) {
				// Set the error message to say that the email is invalid
				$(".errorMessageEmail").text("That email is invalid.");
				// Add a line break
				$(".errorMessageEmail").append("<br>");
			}
			// If a 409 error is returned
			else if (xhr.status == 409) {
				// Set the error message to say that the email is already taken
				$(".errorMessageEmail").text("That email is already taken.");
				// Add a line break
				$(".errorMessageEmail").append("<br>");
			}
		}
	});
});

// Code to be ran when the user clicks on the change password button
$("#changePasswordButton").click(() => {
	// Send an ajax request
	$.ajax({
		// Send to the password settings api route
		url: "/api/settings/password/",
		// Request type of PUT
		type: "PUT",
		// Send the old password, new password and confirm password text box values
		data: { oldPassword: $("#oldPasswordTextbox").val(), newPassword: $("#newPasswordTextbox").val(), confirmPassword: $("#confirmPasswordTextbox").val() },
		// On success
		success: (data, status, xhr) => {
			// Redirect the user to the logout page
			window.location.href = "/logout";
		},
		// On error
		error: (xhr, status, error) => {
			// If a 401 error is returned
			if (xhr.status == 401) {
				// Set the error message to say that the password was incorrect
				$(".errorMessagePassword").text("Password incorrect.");
				// Add a line break
				$(".errorMessagePassword").append("<br>");
			}
			// If a 404 error is returned
			else if (xhr.status == 404) {
				// Set the error message to say that the user was not found
				$(".errorMessagePassword").text("User not found, try logging out and back in.");
				// Add a line break
				$(".errorMessagePassword").append("<br>");
			}
			// If a 400 error is returned
			else if (xhr.status == 400) {
				// Set the error message to say that all fields must be filled out
				$(".errorMessagePassword").text("Please fill out all the fields. If you don't know your old password, log out and click 'Forgot password'.");
				// Add a line break
				$(".errorMessagePassword").append("<br>");
			}
			// If a 409 error is returned
			else if (xhr.status == 409) {
				// Set the error message to say that the passwords do not match
				$(".errorMessagePassword").text("Passwords do not match.");
				// Add a line break
				$(".errorMessagePassword").append("<br>");
			}
		}
	});
});

// Code to be ran when the user clicks on the delete account button
$("#deleteAccountButton").click(() => {
	// Send an ajax request
	$.ajax({
		// Send to the delete account settings api route
		url: "/api/settings/delete/",
		// Request type of DELETE
		type: "DELETE",
		// Send the password text box value
		data: { password: $("#deleteAccountPasswordTextbox").val() },
		// On success
		success: (data, status, xhr) => {
			// Redirect the user to the logout page
			window.location.href = "/logout";
		},
		// On error
		error: (xhr, status, error) => {
			// If a 401 error is returned
			if (xhr.status == 401) {
				// Set the error message to say that the password was incorrect
				$(".errorMessageDelete").text("Password incorrect.");
				// Add a line break
				$(".errorMessageDelete").append("<br>");
			}
			// If a 404 error is returned
			else if (xhr.status == 404) {
				// Set the error message to say that the user was not found
				$(".errorMessageDelete").text("User not found, try logging out and back in.");
				// Add a line break
				$(".errorMessageDelete").append("<br>");
			}
			// If a 400 error is returned
			else if (xhr.status == 400) {
				// Set the error message to say that all fields must be filled out
				$(".errorMessageDelete").text("Please fill out all the fields. If you don't know your password, log out and click 'Forgot password'.");
				// Add a line break
				$(".errorMessageDelete").append("<br>");
			}
		}
	});
});

// Code to be ran when the document is ready
$(document).ready(() => {
	// Remove the far class from the settings button icon and add the fas class
	$("#settingsButtonIcon").removeClass("far").addClass("fas");
})
