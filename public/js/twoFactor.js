// Code to be ran when the document is ready
$(document).ready(() => {
	// Remove the far class from the settings button icon and add the fas class
	$("#settingsButtonIcon").removeClass("far").addClass("fas");
})

// Code to be ran when the user clicks on the two factor setup button
$("#twoFactorSetupButton").click(() => {
	// If two factor authentication is already enabled
	if (twoFactorEnabled) {
		// Remove the setup button
		$("#twoFactorSetupButton").remove();
		// Add a message to the modal body stating that two factor authentication is already enabled
		$("#twoFactorSetupModalBody").append("<span class='text-danger'>2FA Has already been setup!</span>");
		// Halt execution
		return;
	}
	
	// Reset the error message
	$(".errorMessageTwoFactor").text("");
	// Remove any existing results
	$(".twoFactorResults").remove();

	// Send an ajax request
	$.ajax({
		// Send to the request secret two factor api route
		url: "/api/twofactor/requestSecret",
		// Request type of GET
		type: "GET",
		// On success
		success: (data, status, xhr) => {
			// Remove the setup button
			$("#twoFactorSetupButton").remove();
			// Add a span containing the secret key
			$("#twoFactorSetupModalBody").append("<span class='text-success twoFactorResults'>Secret: " + data.secretKey + "</span>");
			// Add a line break
			$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'>");
			// Add the QR code image
      		$("#twoFactorSetupModalBody").append("<img class='twoFactorResults' src='" + data.url + "' style='display: block;margin: auto;'>");
			// Add a message explaining how to use the QR code / secret
			$("#twoFactorSetupModalBody").append("<span class='text-success twoFactorResults'>Either scan the QR code in your preferred 2FA app, or manually input the secret.</span>");
			// Add a line break
			$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'>");
			// Add another line break
			$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'>");
			// Add a message asking the user to enter the code
			$("#twoFactorSetupModalBody").append("<span class='twoFactorResults'>Enter the code generated by your app so we can validate that the secret you have matches:</span>");
			// Add a line break
			$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'>");
			// Add a text box for the user to enter the code
			$("#twoFactorSetupModalBody").append("<input id='twoFactorCodeVerification' class='twoFactorResults' type='text' style='margin-bottom: 20px;padding: 5px 10px;border-radius: 2px;border: 1px solid #dedede;background-color: #f2f2f2;'>");
			// Add a hidden input containing the secret key
			$("#twoFactorSetupModalBody").append("<input id='secretKeyInput' type='hidden' value='" + data.secretKey + "'>");
			// Add a submit button
			$("#twoFactorSetupModalBody").append("<button id='twofactorCodeSubmissionButton' class='twoFactorResults btn btn-primary' type='button' style='margin-left:10px;'>Submit</button>");

			// Code to be ran when the submit button is clicked
			$("#twofactorCodeSubmissionButton").click(() => {
				// Get the code that the user entered
				var givenCode = $("#twoFactorCodeVerification").val();
				// Get the secret key
				var secretKey = $("#secretKeyInput").val();
			
				// Send an ajax request
				$.ajax({
					// Send to the validate two factor api route
					url: "/api/twofactor/validate",
					// Request type of POST
					type: "POST",
					// Send the code that the user entered and the secret key
					data: { twoFactorCode: givenCode, totpSecretKey: secretKey },
					// On success
					success: (data, status, xhr) => {
						// Remove all of the previous results
						$(".twoFactorResults").remove();
						// Add a message to the modal body stating that two factor authentication has been setup successfully
						$("#twoFactorSetupModalBody").append("<span class='text-success'>2FA Setup successfully! Logout and login to see the effect here.</span>");
					},
					// On error
					error: (xhr, status, error) => {
						// Remove the previous error message if present
						$("#twoFactorVerifyError").remove();
						// Add a message to the modal body stating that the code could not be verified
						$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'><span id='twofactorVerifyError' class='text-danger twoFactorResults'>The code you supplied could not be verified.</span>");
					}
				});
			});
		},
		// On error
		error: (xhr, status, error) => {
			// Set the error message to the status code
			$(".errorMessageTwoFactor").text("Error: " + xhr.status);
			// Add a line break
			$(".errorMessageTwoFactor").append("<br>");
		}
	});
});

// Code to be ran when the user clicks on the two factor disable button
$("#twoFactorDisableButton").click(() => {
	// If two factor authentication is not enabled
	if (!twoFactorEnabled) {
		// Remove the setup button
		$("#twoFactorSetupButton").remove();
		// Add a message to the modal body stating that two factor authentication is already disabled
		$("#twoFactorRemovalModalBody").append("<br><span class='text-danger'>2FA is already disabled.</span>");
		// Halt execution
		return;
	}

	// Send an ajax request
	$.ajax({
		// Send to the disable two factor api route
		url: "/api/twofactor/disable",
		// Request type of POST
		type: "POST",
		// On success
		success: (data, status, xhr) => {
			// Add a message to the modal body stating that two factor authentication has been disabled successfully
			$("#twoFactorRemovalModalBody").append("<br><span class='text-success'>Successfully disabled 2fa, logout and login to verify.</span>");
		},
		// On error
		error: (xhr, status, error) => {
			// Add a message to the modal body stating that an error has occured
			$("#twoFactorRemovalModalBody").append("<br><span class='text-danger'>Error: " + xhr.status + "</span>");
		}
	});
});
