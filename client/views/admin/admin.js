Template.admin.isAdmin = function(){
	return Meteor.user().isAdmin;
}