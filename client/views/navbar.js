

Template.navbar.helpers({
	is_admin: function() {
		if (!Meteor.user())
			return;
		return (Meteor.user().isAdmin || Meteor.user().isModerator);
	},
	username: function() {
		if (Meteor.user())
			return Meteor.user().username;
	},
	points: function() {
		if (Meteor.user().stats){
			return Meteor.user().stats.points.all;
		}
	}

});

Template.navbar.events({
	'click .logout': function() {
		Meteor.logout();
	}, 
	'click .quick': function(){
		$('#quick-game-modal').modal('show');
	}, 
	'click .friends': function(){
	}
});