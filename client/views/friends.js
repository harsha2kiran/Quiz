Meteor.startup(function(){
	Deps.autorun(function(){
		var friends = Meteor.subscribe('friends');
	});
});


Template.friends.events({
	'click .game-invite' : function(evt){
		$('#quick-game-modal').modal('show');
		var test = $('input.invite')[0];
		$(test).val(this.username);
	},
	'click .invite' : function(evt){
		if(evt.target.name == "email"){
			$('#invite_email_modal').modal('show');
		}
		if(evt.target.name == "facebook"){
			if(Meteor.user().services.facebook){
				$('#invite_facebook_modal').modal('show'); 
			}
		}
	}, 
	'click #send-invitation': function(){
		var friend = $('#email-input').val();
		Meteor.call('sendMail',friend,function(err,res){
			$('#invite_email_modal').modal('hide');	
		}); 
	}
});

Template.friends.helpers({
	'friends': function(){
		if(Meteor.user()){
			return Meteor.users.find({_id:{$ne : Meteor.user()._id}});
		}
	},
	'facebookFriends' : function(){
		if(Meteor.user().services.facebook){
			Meteor.call("getFacebookFriendsNames",function(err,res){
				return res;			
			});
			//$('#invite_facebook_modal').modal('show'); 
		}		
	},
});
Template.facebook_friends.helpers({
	'facebookFriends' : function(){
		if(Meteor.user() && Meteor.user().services.facebook){
			var result = Meteor.call("getFacebookFriendsNames",function(err,res){
				Session.set("facebook_friends",res);			
			});
			//$('#invite_facebook_modal').modal('show'); 
		}
	return Session.get("facebook_friends");			
	}
});
Template.facebook_friends.events({
	'click .invite-button' : function(){
		FB.ui({
			method: 'feed',
			link: 'https://developers.facebook.com/docs/dialogs/',
			caption: 'An example caption',
		}, function(response){});

	}

});

var fbSdkLoader = function() {
	if(!Session.get("is Facebook JDK loaded?")) { // Load Facebook JDK only once.
		Session.set("is Facebook JDK loaded?", true);
		window.fbAsyncInit = function() { // See Facebook JavaScript JDK docs at: https://developers.facebook.com/docs/reference/javascript/
	// Init the FB JS SDK
		var initConfig = {
			appId: '1454909601389839', // App ID from the App Dashboard
			status: false, // check the login status upon init?
			cookie: true, // set sessions cookies to allow your server to access the session?
			xfbml: false // parse XFBML tags on this page?
		};
		FB.init(initConfig);
		};
 
		(function(d, debug) { // Load the SDK's source Asynchronously
			var js, id = 'facebook-jssdk',
			ref = d.getElementsByTagName('script')[0];
			if(d.getElementById(id)) {
				return;
			}
			js = d.createElement('script');
			js.id = id;
			js.async = true;
			js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
				ref.parentNode.insertBefore(js, ref);
			}(document, /*debug*/ false));
	}
};
fbSdkLoader(); // run the loader