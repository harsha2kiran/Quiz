
var USER_NOT_FOUND = 3; 
var OK = 0;
var ALREADY_FRIEND = 1; 
var REQUESTED = 2;
var FOR_MY_SELF = 4;
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
Template.friends.rendered = function(){
	$('#invite_email_modal').on('hidden.bs.modal', function(){
		$('#invite-modal-errors').html("");
		$('#email-input').val("");
	});
}

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
		if(evt.target.name == "search"){
			$('#search_friends_modal').modal('show');
		}
	}, 
	'click #send-invitation': function(){
		var friend = $('#email-input').val();
		var send = true;
		if(friend.indexOf("@") == -1){
			$('#invite-modal-errors').html('bad email format');
			send = false;
		}
		_.each(Meteor.user().emails,function(email){
			console.log(email);
			if(email.address == friend){
				$('#invite-modal-errors').html('You can invite yourself');
				send = false;
			}
		});
		if(send){
			Meteor.call('sendMail',friend,function(err,res){
				$('#invite_email_modal').modal('hide');	
			}); 
		}
	}
});

bootstrap_alert = function(){};

bootstrap_alert.warning = function(result) {

	switch(result){
		case FOR_MY_SELF : 
			Deps.afterFlush(function(){
				$('#alert_placeholder').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">×</a><span>'+"You cant invite yourself"+'</span></div>');
			});
			Meteor.setTimeout(function(){
				console.log("timeout");
				console.log($('#alert-placeholder'));
				Deps.afterFlush(function(){
					$('#alert_placeholder').html('');
				});
			},4000);
			break;		
		case OK : 
		console.log("OK");
			Deps.afterFlush(function(){
				$('#alert_placeholder').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">×</a><span>'+"Invitation sent"+'</span></div>');
			});
			Meteor.setTimeout(function(){
				console.log("timeout");
				console.log($('#alert-placeholder'));
				Deps.afterFlush(function(){
					$('#alert_placeholder').html('');
				});
			},4000);
			break;
		case USER_NOT_FOUND:
			Deps.afterFlush(function(){
				$('#alert_placeholder').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">×</a><span>'+"User not found"+'</span></div>');
			});
			Meteor.setTimeout(function(){
				console.log("timeout");
				console.log($('#alert-placeholder'));
				Deps.afterFlush(function(){
					$('#alert_placeholder').html('');
				});
			},4000);
			break;
		case ALREADY_FRIEND:
			Deps.afterFlush(function(){
				$('#alert_placeholder').html('<div class="alert alert-warning"><a class="close" data-dismiss="alert">×</a><span>'+"You are friends already"+'</span></div>');
			});
			Meteor.setTimeout(function(){
				console.log("timeout");
				console.log($('#alert-placeholder'));
				Deps.afterFlush(function(){
					$('#alert_placeholder').html('');
				});
			},4000);		
			break;
		case REQUESTED:
			Deps.afterFlush(function(){
				$('#alert_placeholder').html('<div class="alert alert-warning"><a class="close" data-dismiss="alert">×</a><span>'+"Friend request already sent"+'</span></div>');
			});
			Meteor.setTimeout(function(){
				console.log("timeout");
				console.log($('#alert-placeholder'));
				Deps.afterFlush(function(){
					$('#alert_placeholder').html('');
				});
			},4000);					
	}
}	

Template.friends.events({
	'click #search-button' : function(){
		Meteor.call('searchForUser',$('#search-for-friend').val(),function(err,res){
			console.log("res");
			console.log(res);
			bootstrap_alert.warning(res);
		});
	}
});

Template.friends.helpers({
	'online' : function(){
		console.log(this);
		return this.state == "online";
	},
	'friends': function(){
		if(!Meteor.user())
			return;
		var status = Session.get("friendFilter");
		var friends = Meteor.subscribe('friends',status);	
		var friendsArray = Friends.find().fetch();
		friendsArray.sort(function(a,b){
			return ((a.state == "offline" && b.state == "online") || 
					(a.state == "busy" 	  && b.state == "online") || 
					(a.state == "offline" && b.state == "busy"));
		});
		return friendsArray;
	},
	'facebookFriends' : function(){
		if(Meteor.user().services.facebook){
			Meteor.call("getFacebookFriendsNames",function(err,res){
				return res;			
			});
			$('#invite_facebook_modal').modal('show'); 
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