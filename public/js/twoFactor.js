$(document).ready(() => {
	$("#settingsButtonIcon").removeClass("far").addClass("fas");
})

$("#twoFactorSetupButton").click(() => {
	
	$(".errorMessageTwoFactor").text("");
	$(".twoFactorResults").remove();

	$.ajax({
		url: "/api/twofactor/requestSecret",
		type: "GET",
		success: (data, status, xhr) => {
			$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'>");
			$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'>");
			$("#twoFactorSetupModalBody").append("<span class='text-success twoFactorResults'>Secret: " + data.secret + "</span>");
			$("#twoFactorSetupModalBody").append("<br class='twoFactorResults'>");
      $("#twoFactorSetupModalBody").append("<img class='twoFactorResults' src='" + data_url + "'>");
		},
		error: (xhr, status, error) => {
			$(".errorMessageTwoFactor").text("Error: " + xhr.status);
			$(".errorMessageTwoFactor").append("<br>");
		}
	});
});
