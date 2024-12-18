// Code to be ran when the verify search button is running 
$("#verifySearchButton").click(() => {
	// Clear any error message
	$(".errorMessageVerify").text("");
	// Remove the results container
	$(".verifyResults").remove();

	// Issue an ajax request
	$.ajax({
		// Send to the verify search admin api route
		url: "/api/admin/verifySearch",
		// GET Request type
		type: "GET",
		// Add the username textbox value data
		data: { username: $("#verifyUserUsernameTextbox").val() },
		// On Success
		success: (data, status, xhr) => {
			// Append the verify results containing
			$("#verifyUserModalBody").append("<br class='verifyResults'>");
			$("#verifyUserModalBody").append("<br class='verifyResults'>");

			// Add the username attibute
			$("#verifyUserUsernameTextbox").attr("data-username", data.username);
			
			// Say whether to verify or unverify user
			if(data.verified) {
				$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is verified.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='unverifyUserButton'>Unverify</button>");
			}
			else {
				$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not verified.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='verifyUserButton'>Verify</button>");
			}
			
			$("#verifyUserModalBody").append("<br class='verifyResults'>");

			// Same but for brand verification
			if(data.verifiedBrand) {
				$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is a verified brand.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='unverifyBrandButton'>Unverify brand</button>");
			}
			else {
				$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not a verified brand.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='verifyBrandButton'>Verify brand</button>");
			}

			$("#verifyUserModalBody").append("<br class='verifyResults'>");

			// Same but for admin verification
			if(data.admin) {
				$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is an admin.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='removeAdminButton'>Remove admin</button>");
			}
			else {
				$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not an admin.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='makeAdminButton'>Make admin</button>");
			}

			$("#verifyUserModalBody").append("<br class='verifyResults'>");

			// Same but for gov verification
			if(data.verifiedGovernment) {
				$("#verifyUserModalBody").append("<span class='text-success verifyResults'>" + data.username + " is a verified government.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-danger verifyResults' id='unverifyGovernmentButton'>Unverify government</button>");
			}
			else {
				$("#verifyUserModalBody").append("<span class='text-danger verifyResults'>" + data.username + " is not a verified government.</span>");
				$("#verifyUserModalBody").append("<button class='btn btn-success verifyResults' id='verifyGovernmentButton'>Verify government</button>");
			}
		},
		// On error
		error: (xhr, status, error) => {
			// Show error code for 400
			if (xhr.status == 400) {
				$(".errorMessageVerify").text("Please enter a username.");
				$(".errorMessageVerify").append("<br>");
			}
			// Show error code for 404
			else if (xhr.status == 404) {
				$(".errorMessageVerify").text("That user could not be found.");
				$(".errorMessageVerify").append("<br>");
			}
			// Show error code for other errors
			else {
				$(".errorMessageVerify").text("Unknown error occured. Code: " + xhr.status);
				$(".errorMessageVerify").append("<br>");
			}
		}
	});
});

// Function to run the verification api call
function verifyApiCall(textboxName, type, action) {
	// Issue ajax request
	$.ajax({
		// Send to admin api verification endpoint
		url: "/api/admin/verify",
		// PUT request
		type: "PUT",
		// Add the type, action and username
		data: { username: $(textboxName).attr("data-username"), type: type, action: action },
		// On sucess
		success: (data, status, xhr) => {

			$(".errorMessageVerify").text("");
			$(".verifyResults").remove();

			// Print that it is successful
			$("#verifyUserModalBody").append("<span class='text-success verifyResults'>Success!</span>");

			// Repeat the code from before
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
					else {
						$(".errorMessageVerify").text("Unknown error occured. Code: " + xhr.status);
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

// Call individual verify
$(document).on("click", "#verifyUserButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "user", "verify");
});

// Call individual unverify
$(document).on("click", "#unverifyUserButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "user", "unverify");
});

// Call brand verify
$(document).on("click", "#verifyBrandButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "brand", "verify");
});

// Call brand unverify
$(document).on("click", "#unverifyBrandButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "brand", "unverify");
});

// Call admin verify
$(document).on("click", "#makeAdminButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "admin", "make");
});

// Call admin unverify
$(document).on("click", "#removeAdminButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "admin", "remove");
});

// Call gov verify
$(document).on("click", "#verifyGovernmentButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "government", "verify");
});

// Call gov unverify
$(document).on("click", "#unverifyGovernmentButton", () => {
	verifyApiCall("#verifyUserUsernameTextbox", "government", "unverify");
});

// Function to be ran when the ban search button is clicked
$("#banSearchButton").click(() => {
	
	// Clear any previous results
	$(".errorMessageBan").text("");
	$(".banResults").remove();

	// Issue the ajax request and output any results
	$.ajax({
		// Send to the ban search admin api endpoint
		url: "/api/admin/banSearch",
		// Type of GET
		type: "GET",
		// Send the username as supplied in the textbox
		data: { username: $("#banUserUsernameTextbox").val() },
		// On success update the results accordingly
		success: (data, status, xhr) => {
			$("#banUserModalBody").append("<br class='banResults'>");
			$("#banUserModalBody").append("<br class='banResults'>");

			$("#banUserUsernameTextbox").attr("data-username", data.username);
			
			if(data.banned) {
				$("#banUserModalBody").append("<span class='text-danger banResults'>" + data.username + " is banned.</span>");
				$("#banUserModalBody").append("<button class='btn btn-success banResults' id='unbanUserButton'>Unban</button>");
			}
			else {
				$("#banUserModalBody").append("<span class='text-success banResults'>" + data.username + " is not banned.</span>");
				$("#banUserModalBody").append("<button class='btn btn-danger banResults' id='banUserButton'>Ban</button>");
			}
		},
		// On error, return the appropriate error message
		error: (xhr, status, error) => {
			if (xhr.status == 400) {
				$(".errorMessageBan").text("Please enter a username.");
				$(".errorMessageBan").append("<br>");
			}
			else if (xhr.status == 404) {
				$(".errorMessageBan").text("That user could not be found.");
				$(".errorMessageBan").append("<br>");
			}
			else {
				$(".errorMessageBan").text("Unknown error occured. Code: " + xhr.status);
				$(".errorMessageBan").append("<br>");
			}
		}
	});
});

// I use the same structure as verify (ie including type) despite currently only having 1 type for simplicity but also for future when I add suspensions, shadowbans etc
function banApiCall(textboxName, type, action) {
	// Same as the verify api call but with ban route instead of verification
	$.ajax({
		url: "/api/admin/ban",
		type: "PUT",
		data: { username: $(textboxName).attr("data-username"), type: type, action: action },
		success: (data, status, xhr) => {

			$(".errorMessageBan").text("");
			$(".banResults").remove();

			$("#banUserModalBody").append("<span class='text-success banResults'>Success!</span>");

			$.ajax({
				url: "/api/admin/banSearch",
				type: "GET",
				data: { username: $("#banUserUsernameTextbox").val() },
				success: (data, status, xhr) => {
					$("#banUserModalBody").append("<br class='banResults'>");
					$("#banUserModalBody").append("<br class='banResults'>");
		
					$("#banUserUsernameTextbox").attr("data-username", data.username);
					
					if(data.banned) {
						$("#banUserModalBody").append("<span class='text-danger banResults'>" + data.username + " is banned.</span>");
						$("#banUserModalBody").append("<button class='btn btn-success banResults' id='unbanUserButton'>Unban</button>");
					}
					else {
						$("#banUserModalBody").append("<span class='text-success banResults'>" + data.username + " is not banned.</span>");
						$("#banUserModalBody").append("<button class='btn btn-danger banResults' id='banUserButton'>Ban</button>");
					}
				},
				error: (xhr, status, error) => {
					if (xhr.status == 400) {
						$(".errorMessageBan").text("Please enter a username.");
						$(".errorMessageBan").append("<br>");
					}
					else if (xhr.status == 404) {
						$(".errorMessageBan").text("That user could not be found.");
						$(".errorMessageBan").append("<br>");
					}
					else {
						$(".errorMessageBan").text("Unknown error occured. Code: " + xhr.status);
						$(".errorMessageBan").append("<br>");
					}
				}
			});
		},
		error: (xhr, status, error) => {
			$(".errorMessageBan").text("Something went wrong: " + error);
		}
	});
};

// Code to be ran when the ban user button is clicked
$(document).on("click", "#banUserButton", () => {
	// Format is username container, type and action (type represents ban/suspension etc action is the positive or negative action)
	// Issue the ban user api call
	banApiCall("#banUserUsernameTextbox", "ban", "ban");
});

// Code to be ran when the unban user button is clicked
$(document).on("click", "#unbanUserButton", () => {
	// Issue the unban user api call
	banApiCall("#banUserUsernameTextbox", "ban", "unban");
});

// Same as previous but for adding debug likes
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
			else {
				$(".errorMessageAddlike").text("Unknown error occured. Code: " + xhr.status);
				$(".errorMessageAddLike").append("<br>");
			}
		}
	});
});

// Code to be ran to issue ajax request when the add like button is clicked adding a like to the specified post 
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

// Same code in previous block, but adding 5 likes instead of just 1
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

$("#addBoostSearchButton").on("click", () => {
	$(".errorMessageAddBoost").text("");
	$(".addBoostResults").remove();

	$.ajax({
		url: "/api/admin/addBoostSearch",
		type: "GET",
		data: { id: $("#addBoostIdTextbox").val() },
		success: (data, status, xhr) => {
			$("#addBoostModalBody").append("<br class='addBoostResults'>");
			$("#addBoostModalBody").attr("data-id", data._id);

			$("#addBoostModalBody").append("<span class='text-success addBoostResults'>Post found!</span><br class='addBoostResults'>");

			$("#addBoostModalBody").append("<span class=text-success addBoostResults'>Boost Status: " + data.boosted + "</span>");

			$("#addBoostModalBody").append("<br class='addBoostResults'>");

			$("#addBoostModalBody").append("<button class='btn btn-success addBoostResults' id='addBoostButton'>Add boost</button>&nbsp;&nbsp;");
		},
		error: (xhr, status, error) => {
			if (xhr.status == 400) {
				$(".errorMessageAddBoost").text("Please enter a post id.");
				$(".errorMessageAddBoost").append("<br>");
			}
			else if (xhr.status == 404) {
				$(".errorMessageAddBoost").text("That post could not be found.");
				$(".errorMessageAddBoost").append("<br>");
			}
			else {
				$(".errorMessageAddBoost").text("Unknown error occured. Code: " + xhr.status);
				$(".errorMessageAddBoost").append("<br>");
			}
		}
	});
});
$(document).on("click", "#addBoostButton", () => {
	$.ajax({
		url: "/api/admin/addBoost",
		type: "PUT",
		data: { id: $("#addBoostModalBody").attr("data-id") },
		success: (data, status, xhr) => {
			$(".errorMessageAddBoost").text("");
			$(".addBoostFinalResults").remove();

			$("#addBoostModalBody").append("<span class='text-success addBoostFinalResults'>Success!</span>");
		},
		error: (xhr, status, error) => {
			$(".errorMessageAddBoost").text("Something went wrong: " + error);
		}
	});
});

$("#statsSearchButton").click(() => {
	
	// Remove any results from previous search
	$(".errorMessageStats").text("");
	$(".statsResults").remove();

	// Issue ajax request
	$.ajax({
		// Send it to the stats endpoint
		url: "/api/admin/stats",
		// Type of GET
		type: "GET",
		// On success
		success: (data, status, xhr) => {
			// Append the retrieved statistics to the stats results container
			$("#statsModalBody").append("<br class='statsResults'>");
			$("#statsModalBody").append("<br class='statsResults'>");
			$("#statsModalBody").append("<span class='text-success statsResults'>Users: " + data.getUserCount + "</span>");
			$("#statsModalBody").append("<br class='statsResults'>");
			$("#statsModalBody").append("<span class='text-success statsResults'>Posts (& replies): " + data.getPostCount + "</span>");
			$("#statsModalBody").append("<br class='statsResults'>");
			$("#statsModalBody").append("<span class='text-success statsResults'>Messages: " + data.getMessageCount + "</span>");
			$("#statsModalBody").append("<br class='statsResults'>");
		},
		// On error
		error: (xhr, status, error) => {
			// Output the errors so user can see them
			$(".errorMessageStats").text("Error: " + xhr.status);
			$(".errorMessageStats").append("<br>");
		}
	});
});

// On page load, fill in the admin button on the navbar
$(document).ready(() => {
	$("#adminButtonIcon").removeClass("far").addClass("fas");
})
