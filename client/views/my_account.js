Meteor.startup(function(){
	//Meteor.subscribe('mybadges',Meteor.user().points);
});

Template.my_account.events({
	'click #change-password-button': function(evt) {
		evt.preventDefault();

		$("#change-password-errors").html("");
		$("#change-password-success").html("");
		$("div").removeClass("has-error");
		var errors = [];

		var currentPassword = $("#current-password").val();
		
		if (!currentPassword) {
			errors.push("Please enter your current password");
			$("#current-password").parent(".form-group").addClass("has-error");
		}
		
		var newPassword1 = $("#new-password1").val();
		var newPassword2 = $("#new-password2").val();

		if (!newPassword1 || !newPassword2) {
			errors.push("Please enter a new password");
			$("#new-password1").parent(".form-group").addClass("has-error");
			$("#new-password2").parent(".form-group").addClass("has-error");
		}

		if (newPassword1 !== newPassword2) {
			errors.push("The two new passwords you entered do not match");
			$("#new-password1").parent(".form-group").addClass("has-error");
			$("#new-password2").parent(".form-group").addClass("has-error");
		}
		
		if (errors.length) {
			console.log('errors');
			$("change-password-errors").html("<strong>Errors:</strong><ul>");
			_.each(errors, function(error) {
				$("#change-password-errors").append("<li>" + error  + "</li>");
			});
			$("#change-password-errors").append("</ul>");

		} else {
			Accounts.changePassword(currentPassword, newPassword1, function(err) {
				if (err) {
					$("#change-password-errors").html("<strong>Error:</strong> " + err.reason);
				} else {
					console.log('password chanegd');
					$("#change-password-success").html("<strong>Success!</strong> Your password has been changed");
				}
			});
		}
	}
});
Template.my_badges.badges = function(){
	//check why $lt doesnt work ??? 
	var result = []; 
	var points = Meteor.user().stats.points.all;
	console.log("user");
	console.log(Meteor.user());
	Badges.find().forEach(function(badge){
		console.log("badges"); 
		console.log(points);
		if(badge.points < points){
			result.push(badge); 
		}
	});
	return result;
}