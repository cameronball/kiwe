$("#verifySearchButton").click(() => {
	
	$(".errorMessageVerify").text("");
	$(".verifyResults").remove();

	$.ajax({
		url: "/api/admin/verifySearch",
		type: "GET",
		data: { username: $("#verifyUserUsernameTextbox").val() },
		success: (data, status, xhr) => {
			$("#verifyUserModalBody").append("<br class='verifyResults'>");
			$("#verifyUserModalBody").append("<br class='verifyResults'>");

			$("#verifyUserUsernameTextbox").attr("data-username", data.username);
			
			if(data.verified) {
				$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is verified.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='unverifyUserButton'>Unverify</button>");
			}
			else {
				$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not verified.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='verifyUserButton'>Verify</button>");
			}
			
			$("#verifyUserModalBody").append("<br class='verifyResults'>");

			if(data.verifiedBrand) {
				$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is a verified brand.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='unverifyBrandButton'>Unverify brand</button>");
			}
			else {
				$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not a verified brand.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='verifyBrandButton'>Verify brand</button>");
			}

			$("#verifyUserModalBody").append("<br class='verifyResults'>");

			if(data.admin) {
				$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is an admin.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='removeAdminButton'>Remove admin</button>");
			}
			else {
				$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not an admin.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='makeAdminButton'>Make admin</button>");
			}

			$("#verifyUserModalBody").append("<br class='verifyResults'>");

			if(data.verifiedGovernment) {
				$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is a verified government.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='unverifyGovernmentButton'>Unverify government</button>");
			}
			else {
				$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not a verified government.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='verifyGovernmentButton'>Verify government</button>");
			}
		},
		error: (xhr, status, error) => {
			if (xhr.status == 400) {
				$(".errorMessageVerify").text("Please enter a username.");
				$(".errorMessageVerify").append("<br>");
			}
			else if (xhr.status == 404) {
				$(".errorMessageVerify").text("That user could not be found.");
				$(".errorMessageVerify").append("<br>");
			}
		}
	});
});

function verifyApiCall(textboxName, type, action) {
	$.ajax({
		url: "/api/admin/verify",
		type: "PUT",
		data: { username: $(textboxName).attr("data-username"), type: type, action: action },
		success: (data, status, xhr) => {

			$(".errorMessageVerify").text("");
			$(".verifyResults").remove();

			$("#verifyUserModalBody").append("<span class='text-success verifyResults'>Success!</span>");

			$.ajax({
				url: "/api/admin/verifySearch",
				type: "GET",
				data: { username: $(textboxName).attr("data-username") },
				success: (data, status, xhr) => {
					$("#verifyUserModalBody").append("<br class='verifyResults'>");
					$("#verifyUserModalBody").append("<br class='verifyResults'>");
		
					$("#verifyUserUsernameTextbox").attr("data-username", data.username);
					
					if(data.verified) {
						$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is verified.</span>");
						$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='unverifyUserButton'>Unverify</button>");
					}
					else {
						$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not verified.</span>");
						$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='verifyUserButton'>Verify</button>");
					}
					
					$("#verifyUserModalBody").append("<br class='verifyResults'>");
		
					if(data.verifiedBrand) {
						$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is a verified brand.</span>");
						$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='unverifyBrandButton'>Unverify brand</button>");
					}
					else {
						$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not a verified brand.</span>");
						$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='verifyBrandButton'>Verify brand</button>");
					}
		
					$("#verifyUserModalBody").append("<br class='verifyResults'>");
		
					if(data.admin) {
						$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is an admin.</span>");
						$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='removeAdminButton'>Remove admin</button>");
					}
					else {
						$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not an admin.</span>");
						$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='makeAdminButton'>Make admin</button>");
					}

					$("#verifyUserModalBody").append("<br class='verifyResults'>");

					if(data.verifiedGovernment) {
						$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is a verified government.</span>");
						$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='unverifyGovernmentButton'>Unverify government</button>");
					}
					else {
						$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not a verified government.</span>");
						$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='verifyGovernmentButton'>Verify government</button>");
					}
				},
				error: (xhr, status, error) => {
					if (xhr.status == 400) {
						$(".errorMessageVerify").text("Please enter a username.");
						$(".errorMessageVerify").append("<br>");
					}
					else if (xhr.status == 404) {
						$(".errorMessageVerify").text("That user could not be found.");
						$(".errorMessageVerify").append("<br>");
					}
				}
			});
		},
		error: (xhr, status, error) => {
			$(".errorMessageVerify").text("Something went wrong: " + error);
		}
	});
};

$(document).on("click", "#verifyUserButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "user", "verify");
});

$(document).on("click", "#unverifyUserButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "user", "unverify");
});

$(document).on("click", "#verifyBrandButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "brand", "verify");
});

$(document).on("click", "#unverifyBrandButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "brand", "unverify");
});

$(document).on("click", "#makeAdminButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "admin", "make");
});

$(document).on("click", "#removeAdminButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "admin", "remove");
});

$(document).on("click", "#verifyGovernmentButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "government", "verify");
});

$(document).on("click", "#unverifyGovernmentButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "government", "unverify");
});

$("#addLikeSearchButton").on("click", () => {
	$(".errorMessageAddLike").text("");
	$(".addLikeResults").remove();

	$.ajax({
		url: "/api/admin/addLikeSearch",
		type: "GET",
		data: { id: $("#addLikeIdTextbox").val() },
		success: (data, status, xhr) => {
			$("#addLikeModalBody").append("<br class='addLikeResults'>");
			$("#addLikeModalBody").attr("data-id", data._id);

			$("#addLikeModalBody").append("<span class='text-success addLikeResults'>Post found!</span><br class='addLikeResults'>");
			$("#addLikeModalBody").append("<span class='text-success addLikeResults likeNumber'>Likes: " + data.likes.length + " </span>");

			$("#addLikeModalBody").append("<br class='addLikeResults'>");

			$("#addLikeModalBody").append("<button class='btn btn-success addLikeResults' id='addLikeButton'>Add like</button>&nbsp;&nbsp;");
			$("#addLikeModalBody").append("<button class='btn btn-success addLikeResults' id='addFiveLikesButton'>Add 5 likes</button>")
		},
		error: (xhr, status, error) => {
			if (xhr.status == 400) {
				$(".errorMessageAddLike").text("Please enter a post id.");
				$(".errorMessageAddLike").append("<br>");
			}
			else if (xhr.status == 404) {
				$(".errorMessageAddLike").text("That post could not be found.");
				$(".errorMessageAddLike").append("<br>");
			}
		}
	});
});
$(document).on("click", "#addLikeButton", () => {
	$.ajax({
		url: "/api/admin/addLike",
		type: "PUT",
		data: { id: $("#addLikeModalBody").attr("data-id"), number: 1 },
		success: (data, status, xhr) => {
			$(".errorMessageAddLike").text("");
			$(".addLikeFinalResults").remove();

			$("#addLikeModalBody").append("<span class='text-success addLikeFinalResults'>Success!</span>");
			$(".likeNumber").text("Likes: " + data.likes.length);
		},
		error: (xhr, status, error) => {
			$(".errorMessageAddLike").text("Something went wrong: " + error);
		}
	});
});

$(document).on("click", "#addFiveLikesButton", () => {
	$.ajax({
		url: "/api/admin/addLike",
		type: "PUT",
		data: { id: $("#addLikeModalBody").attr("data-id"), number: 5 },
		success: (data, status, xhr) => {
			$(".errorMessageAddLike").text("");
			$(".addLikeFinalResults").remove();

			$("#addLikeModalBody").append("<span class='text-success addLikeFinalResults'>Success!</span>");
			$(".likeNumber").text("Likes: " + data.likes.length);
		},
		error: (xhr, status, error) => {
			$(".errorMessageAddLike").text("Something went wrong: " + error);
		}
	});
});

$(document).ready(() => {
	$("#settingsButtonIcon").removeClass("far").addClass("fas");
})
