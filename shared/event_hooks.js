
if(Meteor.isClient){
	Meteor.startup(function(){
		Hooks.init({treatCloseAsLogout:true});
	});	
}

if(Meteor.isServer){
	Hooks.onLoggedIn = function(userId){
		Meteor.call('setUserState',"online",userId);
	}
	Hooks.onLoggedOut = function(userId){
		Meteor.call('setUserState',"offline",userId);
	}	
}
