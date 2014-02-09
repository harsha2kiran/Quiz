Meteor.startup(function(){
	Hooks.init({treatCloseAsLogout:true});
	console.log("hooks");
	console.log(Hooks);
});

Hooks.onLoggedIn = function(){
	Meteor.call('setUserState',"available",Meteor.user()._id);
}
Hooks.onLoggedOut = function(){
	Meteor.call('setUserState',"unavailable",Meteor.user()._id);
}