"use strict";

/* SOME CONSTANTS */
var endpoint01 = "http://misdemo.temple.edu/rentzen";
var endpoint02 = "http://3.16.109.136:8222";
localStorage.usertoken = 0;
localStorage.lastnavlink = '';

/* SUPPORTING FUNCTIONS */

var propertyObj;

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
		$("#div-property").show()
		$("#map").hide();
		$("#property-image").show();
	}

	if (idToShow == '#div-login') {
		/* what happens if the login/logout link is clicked? */
		$("#renterid").val("");
		localStorage.usertoken = 0;
		$(".secured").addClass("locked");
		$(".secured").removeClass("unlocked");
	}

	if (idToShow == '#div-applications') {
		myApplicationsPage();
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
	console.log(the_serialized_data)
	var url = endpoint02 + '/renter';
	$.ajax({
		url: url,
		type: "PUT",
		data: the_serialized_data,
		success: function (data) {
			console.log(data)
			console.log("success");
			$("#update-success").show().html("Profile successfully updated")
			$("#update-failure").hide();
		},
		error: function (data) {
			console.log(data);
			$("#update-failure").show().html("Profile failed to update.")
			$("#update-success").hide();
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
			$("#searcherror").hide().html(data.responseText)
			for( var i = 0; i < data.length; i++){
				if(data[i].picture_url == ""){
					propPic =  "<img class='img-fluid' src='images/no_image.png'></img>"
				}
				var thumbnail = "<div class='col-md-6'><div>"
				var propertyId = "<input type='hidden' name='propertyid' value='" + data[i].propertyid + "'>"

				appendProperty = thumbnail + "<a onclick='navigationControl(this);' href='#div-property'>" + data[i].street + "<br>" + propPic + propertyId +"</a>"  +  "</div></div>"
				$("#divrow").append(appendProperty);
			}
			navigationControl("#showProp");
		},
		error: function(data){
			console.log("error", data);
			$("#searcherror").show().html(data.responseText)
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

			if (result.picture_url == ""){
				var propPic =  "<img class='img-fluid' src='images/no_image.png'></img>"
			}
			
			$("#streetName").html(result.street);
			$("#property-image").html(propPic)
			$("#description").html(result.description);
			$("#city1").html(result.city);
			$("#beds").html(result.beds);
			$("#baths").html(result.baths);
			$("#sqft").html(result.sqft);
			$("#rental_fee").html(result.rental_fee);
			$("#address").val(result.street + " " + result.city + " " + result.state)

			propertyObj = result;

		},
		error: function(){
			console.log(result)
		}
	});
}

// returns latitude and longitude of given address: {lat: xxxxx, lng: xxxxx}
var getGeoCode = function(){
	var the_serialized_data = $("#geocode").serialize();
	console.log(the_serialized_data);
	var url = "https://maps.googleapis.com/maps/api/geocode/json";
	console.log($("#geocode"))
	$.ajax({
		url: url,
		type: "GET",
		data: the_serialized_data,
		success: function(result){
			console.log(result.results[0].geometry.location);
			generateGoogleMap(result.results[0].geometry.location)
		},
		error: function(result){
			console.log(result);
		}
	});
};

var generateGoogleMap = function(street){
	var map = new google.maps.Map(document.getElementById("map"), {zoom: 17, center: street});
	var marker = new google.maps.Marker({position: street, map: map});
	$("#map").show();
	$("#property-image").hide();

}

var renderApplicationPage = function(){
	console.log("property: ", propertyObj)
	$("#streetName2").html(propertyObj.street)
	$("#landlord-name").val(propertyObj.landlordfirstname + " " + propertyObj.landlordlastname);
	$("#email-address").val(propertyObj.landlordusername);
	$("#fullname").val($("#firstname1").val() + " " + $("#lastname1").val());
	$("#credit-score").val($("#creditrating1").val());
	$("#income2").val($("#income1").val());
	$("#phone2").val($("#phone1").val());
	$("#email2").val($("#username1").val());

	if (propertyObj.picture_url == ""){
		var propPic =  "<img class='img-fluid' src='images/no_image.png'></img>"
	}

	$("#property-image2").html(propPic)
}

var myApplicationsPage = function(renterId){
	var data = "renterid=" + localStorage.usertoken;
	var url = endpoint02 + "/rentalapplications"
	$.ajax({
		url: url,
		type: "GET",
		data: data,
		success: function(result){
			console.log(result);
			$("#rentalApplications").html("<tr><th>Property</th><th>Landlord</th><th>Rental Fee</th><th>Status</th></tr>");
			for(var i = 0; i < result.length; i++){
				var tableInput = "<tr><td>" + result[i].street + "</td><td>" + result[i].landlordfirstname + " " + result[i].landlordlastname + "</td><td>" + result[i].rental_fee + "</td><td>" + result[i].applicationstatus +"</td></tr>";
				$("#rentalApplications").append(tableInput);
			}
		},
		error: function(result){
			console.log(result)
			$("#rentalApplications").html(result.responseText);
		}
	})
}

var submitApplication = function(){
	$("#renteridH").val(localStorage.usertoken);
	$("#propertyidH").val(propertyObj.propertyid);
	$("#move_in_dateH").val($("#date").val());
	$("#rentermessageH").val($("#landlord-message").val());


	var data = $("#hiddenapp").serialize();
	var url = endpoint02 + "/rentalapplications";
	console.log(data)
	$.ajax({
		url: url,
		type: "POST",
		data: data,
		success: function(result){
			console.log(result)
			$("#application_success").show().html("Application Submitted")
			$("#application_error").hide();
		},
		error: function(result){
			console.log(result)
			$("#application_error").show().html(result.responseText)
			$("#application_success").hide();
		}
	})
}

var hideErrors = function(){
	$(".alert").hide();
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
	$(".nav-link, .list-group-item, #signup-link, #update-link").click(function () {
		hideErrors();
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

	$("#google-map").click(function(){
		getGeoCode();
	})

	$("#btnApply").click(function() {
		renderApplicationPage();
		buttonFunc("#div-rentalApp");
	})

	$("#btnSubmitApp").click(function(){
		submitApplication();
	})

}); /* end the document ready event*/