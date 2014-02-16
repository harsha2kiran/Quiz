
var autoDep = new Deps.Dependency;
Meteor.startup(function(){
	Session.setDefault("friendFilter","all");
	Session.set("facebookFriends",false);
	Deps.autorun(function(){
		var status = Session.get("friendFilter");
		console.log(status);
		var friends = Meteor.subscribe('friends',status);

	});
});


Template.friends.events({
	'click .sort-friends' : function(evt){
		console.log("click");
		Session.set("friendFilter",evt.target.name);
	},
	'click .game-invite' : function(evt){
		$('#quick-game-modal').addClass('modalActive');
		$('#quick-game-modal').removeClass('modalHidden');
		console.log(this);
		Session.set("invitedFriend",this.username);
	},
	'click .invite' : function(evt){
		if(evt.target.name == "email"){
			$('#invite_email_modal').modal('show');
		}
		if(evt.target.name == "facebook"){
			if(Meteor.user().services.facebook){
				$('#invite_facebook_modal').modal('show'); 
			}else{
				$('#facebook-connect-modal').modal('show');
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
	'online' : function(){
		console.log(this);
		return this.state == "online";
	},
	'friends': function(){
		var status = Session.get("friendFilter");
		var friends = Meteor.subscribe('friends',status);	
		Meteor.users.find({_id:{$ne : Meteor.user()._id}});
		return Meteor.users.find({_id:{$ne : Meteor.user()._id}});
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
		autoDep.depend();
		if(Meteor.user() && Meteor.user().services.facebook){
			var result = Meteor.call("getFacebookFriendsNames",function(err,res){
				if(res != undefined){
					Session.set("facebook_friends",res);
				}else{
					autoDep.changed();
				}
							
			});
			//$('#invite_facebook_modal').modal('show'); 
		}else{
			
		}
	return Session.get("facebook_friends");			
	}
});
Template.facebook_friends.events({
	'click .invite-button' : function(){
		var self = this;

		FB.getLoginStatus(function(response) {
		  if (response.status === 'connected') {
		  	FB.ui({
		  		from:response.authResponse.userID,
				to: self.id,
				method: 'feed',
				link: 'http://ourSuperApp.com',
			}, function(response){});
		    
		  }
		});

	}

});
Template.facebookConnectModal.events({
	'click .confirm-facebook': function(){
      Meteor.call('getFacebookCode',function(err,res){
      	console.log("res");
      	console.log(res);
      	$('#facebook-connect-modal').modal('hide');
        var x = screen.width/2 - 700/2;
        var y = screen.height/2 - 450/2;
        window.location.replace(res);
      }); 
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
fbSdkLoader();