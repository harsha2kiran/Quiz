Meteor.startup(function(){
	Deps.autorun(function(){
		Meteor.subscribe('allUsers');
	});
});

Template.edit_users.helpers({
	users: function() {
		return Meteor.users.find({}, { sort: { username: 1 } })
	},
	is_admin: function() {
		return this.isAdmin;
	},
	is_moderator: function() {
		return this.isModerator;
	},
	is_not_me: function() {
		if (Meteor.user())
			return this._id !== Meteor.user()._id
	}
});

Template.edit_users.events({
	'click .revoke-admin': function() {
		Meteor.call('revokeAdmin', this._id, function(err, res) {
			
		});
	},	
	'click .make-admin': function() {
		Meteor.call('makeAdmin', this._id, function(err, res) {

		});
	},
	'click .revoke-mod': function() {
		Meteor.call('revokeModerator', this._id, function(err, res) {
			
		});
	},	
	'click .make-mod': function() {
		Meteor.call('makeModerator', this._id, function(err, res) {

		});
	},
	'click .change-password': function(evt) {
		evt.preventDefault();
		var userId = this._id;
		$("#new-password-span-" + userId).html('New Password: <input type="password" id="new-password-1-' + userId + '"> ');
		$("#new-password-span-" + userId).append('Again: <input type="password" id="new-password-2-' + userId + '"> ');
		$("#new-password-span-" + userId).append('<button class="btn btn-success" id="confirm-change-password-' + userId + '">Change</button> ');
		$("#new-password-span-" + userId).append('<button class="btn btn-danger" id="cancel-password-' + userId + '">Cancel</button> ');
		$("#new-password-span-" + userId).append('<span id="change-password-result-' + userId + '"></span>');
		//have to add event listeners here because elements are dynamically added
		//when cancel is clicked...
		$("#cancel-password-" + userId).on("click", function() {
			//changed DOM to like it was before
			$("#new-password-span-" + userId).html('<a href="#" class="change-password">Change Password</a>');
		});
		//when change is clicked...
		$("#confirm-change-password-" + userId).on("click", function() {
			var errors = [];
			$("#change-password-result-" + userId).html("");
			var password1 = $("#new-password-1-" + userId).val();
			var password2 = $("#new-password-2-" + userId).val();
			if (!password1 || !password2) {
				errors.push("A Password is blank");
			}

			if (password1 !== password2) {
				errors.push("Passwords don't match");
			}
			
			if (errors.length) {
				$("#change-password-result-" + userId).html("Error: " + errors.join(', '));
			} else {
				Meteor.call('changeUserPassword', userId, password1, function(err, res) {
					if (err) {
						$("#change-password-result-" + userId).html("Error: " + err.reason);
					} else {
						$("#change-password-result-" + userId).html("Success! Password changed.");
					}
				});
			}
		});
	},
	'click .delete-user': function() {
		Meteor.call('deleteUser', this._id);
	}
});