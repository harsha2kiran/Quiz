Template.navbar.helpers({
	is_admin: function() {
		if (!Meteor.user())
			return;

		return Meteor.user().isAdmin;
	},
	username: function() {
		if (Meteor.user())
			return Meteor.user().username;
	},
	points: function() {
		if (Meteor.user())
			return Meteor.user().points;
	}
});

Template.navbar.events({
	'click .logout': function() {
		Meteor.logout();
	}
});