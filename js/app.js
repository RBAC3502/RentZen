"use strict";

/* SOME CONSTANTS */
var endpoint01 = "http://misdemo.temple.edu/rentzen";
var endpoint02 = "http://3.16.109.136:8222";
localStorage.usertoken = 0;
localStorage.lastnavlink = '';

/* SUPPORTING FUNCTIONS */

var navigationControl = function (the_link) {
	console.log(the_link)
	/* manage the content that is displayed */
	var idToShow = $(the_link).attr("href");
	localStorage.lastnavlink = idToShow;
	console.log(the_link)
	console.log(idToShow);

	if(idToShow == "#div-property"){
		var tag = $(the_link).find("input");
		var data = $(tag).serialize();
		console.log(the_link);
		console.log(tag);
		console.log(data);
		renderPropertyPage(data);
	}

	if (idToShow == '#div-login') {
		/* what happens if the login/logout link is clicked? */
		$("#renterid").val("");
		localStorage.usertoken = 0;
		$(".secured").addClass("locked");
		$(".secured").removeClass("unlocked");
	}

	$(".content-wrapper").hide(); /* hide all content-wrappers */
	$(idToShow).show(); /* show the chosen content wrapper */
	$("html, body").animate({
		scrollTop: "0px"
	}); /* scroll to top of page */
	$(".navbar-collapse").collapse('hide'); /* explicitly collapse the navigation menu */
	
} /* end navigation control */

var loginController = function () {
	//go get the data off the login form
	var the_serialized_data = $('#form-login').serialize();
	var url = endpoint02 + '/renter';

	$.ajax({
		url: url,
		type: "GET",
		data: the_serialized_data,
		success: function (result) {
			console.log(result)
			$('#login_message').html('');
			$('#login_message').hide();
			localStorage.usertoken = result.renterid; //login succeeded.  Set usertoken.
			$('.secured').removeClass('locked');
			$('.secured').addClass('unlocked');
			$('#div-login').hide();
			$('#div-dashboard').show();
			$("#renterid").val(result.renterid);
			$("#username1").val(result.username);
			$("#password1").val(result.password);
			$("#firstname1").val(result.firstname);
			$("#lastname1").val(result.lastname);
			$("#phone1").val(result.phone);
			$("#creditrating1").val(result.creditrating);
			$("#income1").val(result.income);
		},
		error: function (result) {
			console.log(result)
			localStorage.usertoken = 0; // login failed.  Set usertoken to it's initial value.
			$('#login_message').html(result.responseJSON);
			$('#login_message').show();
		}
	});

	//scroll to top of page
	$("html, body").animate({
		scrollTop: "0px"
	});
};

var signupFunc = function () {
	var the_serialized_data = $('#form-signup').serialize();
	var url = endpoint02 + '/renter';
	$.ajax({
		url: url,
		type: "POST",
		data: the_serialized_data,
		success: function () {
			buttonFunc("#div-confirmation")
		},
		error: function (result) {
			$("#signup-message").show();
			$("#signup-message").html(result.responseJSON);
			console.log(result)
		}
	});
}

var updateProfile = function () {
	var the_serialized_data = $('#form-profile').serialize();
	var url = endpoint02 + '/renter';
	$.ajax({
		url: url,
		type: "PUT",
		data: the_serialized_data,
		success: function () {
			console.log("success");
			$("#update-message").show().html("success")
		},
		error: function (data) {
			console.log(data);
			$("#update-message").show().html("failure")
		}
	})
}

var buttonFunc = function (div) {
	$(".content-wrapper").hide();
	$(div).show();
	$("html, body").animate({
		scrollTop: "0px"
	}); /* scroll to top of page */
	$(".navbar-collapse").collapse('hide');
}

var searchProperties = function(){
	var the_serialized_data = $("#form-search").serialize();
	var url = endpoint02 + "/rentalproperties"
	$("#divrow").html("");
	$.ajax({
		url: url,
		type: "GET",
		data: the_serialized_data,
		success: function(data){
			var appendProperty;
			var propPic;
			$("#properties").html("");

			for( var i = 0; i < data.length; i++){
				if(data[i].picture_url == ""){
					propPic =  "<img class='img-fluid' src='images/no_image.png'></img>"
				}
				var thumbnail = "<div class='col-md-6'><div>"
				var propertyId = "<input type='hidden' name='propertyid' value='" + data[i].propertyid + "'>"

				appendProperty = thumbnail + "<a onclick='navigationControl(this);' href='#div-property'>" + data[i].street + "<br>" + propPic + propertyId +"</a>" +  "</div></div>"
				$("#divrow").append(appendProperty);
			}
			navigationControl("#showProp");
		},
		error: function(data){
			console.log("error", data);
		}
	})
};

var renderPropertyPage = function(data){
	var url = endpoint02 + "/rentalproperty"
	$.ajax({
		url: url,
		type: "GET",
		data: data,
		success: function(result){
			console.log(result);
			$("#description").html(result.description);
			$("#city").html(result.city);
			$("#beds").html(result.beds);
			$("#baths").html(result.baths);
			$("#square-feet").html(result.sqft);
			$("#monthly-rent").html(result.rental_fee);

		},
		error: function(){
			console.log(result)
		}
	})
}

//document ready section
$(document).ready(function () {

	/* ------------------  basic navigation ----------------*/

	/* lock all secured content */
	$('.secured').removeClass('unlocked');
	$('.secured').addClass('locked');


	/* this reveals the default page */
	$("#div-home").show();

	/* this controls navigation - show / hide pages as needed */

	/* what to do when a navigation link is clicked */
	$(".nav-link, .list-group-item, #signup-link").click(function () {
		navigationControl(this);
		console.log(this);
	});

	/* what happens if the login button is clicked? */
	$('#btnLogin').click(function () {
		loginController();
	});

	$("#signup-button").click(function () {
		buttonFunc("#div-signup");
	});

	$("#signup-button2").click(function () {
		signupFunc();
	});

	$(".signin-button").click(function () {
		buttonFunc("#div-login");
	});

	$("#update-button").click(function () {
		updateProfile();
	});

	$("#btnSearch").click(function(){
		searchProperties();
	})

}); /* end the document ready event*/