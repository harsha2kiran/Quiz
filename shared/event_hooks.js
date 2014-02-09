
if(Meteor.isClient){
	Meteor.startup(function(){
		Hooks.init({treatCloseAsLogout:true});
		console.log("hooks");
		console.log(Hooks);
	});	
}

if(Meteor.isServer){
	Hooks.onLoggedIn = function(userId){
		console.log("user"+userId+"just logged in");
		Meteor.call('setUserState',"online",userId);
	}
	Hooks.onLoggedOut = function(userId){
		console.log("user"+userId+"just logged out");
		Meteor.call('setUserState',"offline",userId);
	}	
}
