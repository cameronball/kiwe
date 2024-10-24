$(document).ready(() => {
	$("#settingsButtonIcon").removeClass("far").addClass("fas");
})

$("#twoFactorSetupButton").click(() => {

	if (twoFactorEnabled) {
		$("#twoFactorSetupButton").remove();
		$("#twoFactorSetupModalBody").append("<span class='text-danger'>2FA Has already been setup!</span>");
		return;
	}
	
	$(".errorMessageTwoFactor").text("");
	$(".twoFactorResults").remove();

	$.ajax({
		url: "/api/twofactor/requestSecret",
		type: "GET",
		success: (data, status, xhr) => {
			$("#twoFactorSetupButton").remove();
			$("#twoFactorSetupModalBody").append("<span class='text-success twoFactorResults'>Secret: " + data.secretKey + "</span>");
			$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'>");
      			$("#twoFactorSetupModalBody").append("<img class='twoFactorResults' src='" + data.url + "' style='display: block;margin: auto;'>");
			$("#twoFactorSetupModalBody").append("<span class='text-success twoFactorResults'>Either scan the QR code in your preferred 2FA app, or manually input the secret.</span>");
			$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'>");
			$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'>");
			$("#twoFactorSetupModalBody").append("<span class='twoFactorResults'>Enter the code generated by your app so we can validate that the secret you have matches:</span>");
			$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'>");
			$("#twoFactorSetupModalBody").append("<input id='twoFactorCodeVerification' class='twoFactorResults' type='text' style='margin-bottom: 20px;padding: 5px 10px;border-radius: 2px;border: 1px solid #dedede;background-color: #f2f2f2;'>");
			$("#twoFactorSetupModalBody").append("<input id='secretKeyInput' type='hidden' value='" + data.secretKey + "'>");
			$("#twoFactorSetupModalBody").append("<button id='twofactorCodeSubmissionButton' class='twoFactorResults btn btn-primary' type='button' style='margin-left:10px;'>Submit</button>");

			$("#twofactorCodeSubmissionButton").click(() => {
				var givenCode = $("#twoFactorCodeVerification").val();
				var secretKey = $("#secretKeyInput").val();
			
				$.ajax({
					url: "/api/twofactor/validate",
					type: "POST",
					data: { twoFactorCode: givenCode, totpSecretKey: secretKey },
					success: (data, status, xhr) => {
						$(".twoFactorResults").remove();
						$("#twoFactorSetupModalBody").append("<span class='text-success'>2FA Setup successfully! Logout and login to see the effect here.</span>");
					},
					error: (xhr, status, error) => {
						$("#twoFactorVerifyError").remove();
						$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'><span id='twofactorVerifyError' class='text-danger twoFactorResults'>The code you supplied could not be verified.</span>");
					}
				});
			});
		},
		error: (xhr, status, error) => {
			$(".errorMessageTwoFactor").text("Error: " + xhr.status);
			$(".errorMessageTwoFactor").append("<br>");
		}
	});
});

$("#twoFactorDisableButton").click(() => {
	if (!twoFactorEnabled) {
		$("#twoFactorSetupButton").remove();
		$("#twoFactorRemovalModalBody").append("<br><span class='text-danger'>2FA is already disabled.</span>");
		return;
	}

	$.ajax({
		url: "/api/twofactor/disable",
		type: "POST",
		success: (data, status, xhr) => {
			$("#twoFactorRemovalModalBody").append("<br><span class='text-success'>Successfully disabled 2fa, logout and login to verify.</span>");
		},
		error: (xhr, status, error) => {
			$("#twoFactorRemovalModalBody").append("<br><span class='text-danger'>Error: " + xhr.status + "</span>");
		}
	});
});
