Emails = new Meteor.Collection('emails');
var USER_NOT_FOUND = 3; 
var OK = 0;
var ALREADY_FRIEND = 1; 
var REQUESTED = 2;
var FOR_MY_SELF = 4;
var autoDep = new Deps.Dependency;
var friendsArray;
var friendsFilterDep = new Deps.Dependency;
var changeRulesDep = new Deps.Dependency;
var keyPressed = false;
var keyPressedDep = new Deps.Dependency;
var phrase ="";
var emailPhraseDep = new Deps.Dependency;
var emailFound = false;
var userId ;
var userAvatar;
var emailError;
var emailErrorDep = new Deps.Dependency;
var userFoundName = "";

var inviteFacebookModalClass = 'modalHidden';
var inviteFacebookModalClassDep = new Deps.Dependency;
var conntectFacebookModalClass = 'modalHidden';
var conntectFacebookModalClassDep = new Deps.Dependency;
var inviteEmailModalClass = 'modalHidden';
var inviteEmailModalClassDep = new Deps.Dependency;



// because bootstrap modal doesnt work proerly 
// in meteor this is the best way. 

var closeInviteEmailModal = function(){
	inviteEmailModalClass = 'modalHidden';
	inviteEmailModalClassDep.changed();
	emailError = "";
	emailErrorDep.changed();
	$('#email-invitatio-alert-box').addClass('hidden');
	$('#email-input').val("");
}

var openInviteEmailModal = function(){
	inviteEmailModalClass = 'modalActive';
	inviteEmailModalClassDep.changed();
}

var closeConnectFacebookModal = function(){
	conntectFacebookModalClass = 'modalHidden';
	conntectFacebookModalClassDep.changed();	
};

var openConnectFacebookModal = function(){
	conntectFacebookModalClass = 'modalActive';
	conntectFacebookModalClassDep.changed();	
}

var closeInviteFacebookModal = function(){
	inviteFacebookModalClass = 'modalHidden';
	inviteFacebookModalClassDep.changed();	
};

var openInviteFacebookModal = function(){
	inviteFacebookModalClass = 'modalActive';
	inviteFacebookModalClassDep.changed();	
}

Meteor.startup(function(){
	Meteor.subscribe('usernames');
	Session.setDefault("friendFilter","all");
	Session.set("facebookFriends",false);
	Deps.autorun(function(){
		emailPhraseDep.depend();
		Meteor.call('emailExists',phrase,function(err,res){
			if(res){
				
				emailFound = true;
				userId = res.userId;
				userAvatar = res.avatar;
				userFoundName = res.username;
				changeRulesDep.changed();
			}else if(emailFound){
				changeRulesDep.changed();
				emailFound = false;

			}
		});
		var state = Session.get("friendFilter");
		var friends = Meteor.subscribe('friends');	
		friendsArray = Friends.find().fetch();
		friendsArray.sort(function(a,b){
			return ((a.state == "offline" && b.state == "online") || 
					(a.state == "busy" 	  && b.state == "online") || 
					(a.state == "offline" && b.state == "busy"));
		});
		if(state != "all"){
			friendsArray = _.filter(friendsArray,function(friend){
				return friend.state == state;
			});
		}
		friendsFilterDep.changed();
	});
});



Template.friends.rendered = function(){

	$('#search-friends-box').on("blur",function(){
		Meteor.setTimeout(function(){
			keyPressed = false;
			keyPressedDep.changed();
		},500);
	});
}
Template.invite_email_body.helpers({
	error : function(){
		emailErrorDep.depend();
		return emailError;
	},
});
Template.invite_email_modal.helpers({
	inviteEmailModalClass : function(){
		inviteEmailModalClassDep.depend();
		return inviteEmailModalClass;
	}
});
Template.invite_email_modal.events({
	'click .close' : function(){
		closeInviteEmailModal();
	} 
});
Template.friends.events({
	'click .userPill' : function(){
		var path = "/user/"+this._id;
		Router.go(path);
	},
	'click .avatar-thumb' :function(){
		var path = "/user/"+this._id;
		Router.go(path);		
	},
	'keyup .search-area' : function(){
		phrase = $('#search-friends-box').val();
		console.log("press");
		console.log(keyPressed);
		emailPhraseDep.changed();
		if(!keyPressed && phrase.length>2){
			keyPressed = true;
			keyPressedDep.changed();
		}
		if(keyPressed && phrase.length<3){
			keyPressed = false;
			keyPressedDep.changed();
		}
	},
	'click .sort-friends' : function(evt){
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
			openInviteEmailModal();
		}
		if(evt.target.name == "facebook"){
			if(Meteor.user().services.facebook){
				openInviteFacebookModal();
			}else{
				openConnectFacebookModal();
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
			emailError = "bad email format";
			emailErrorDep.changed();
			Deps.afterFlush(function(){
				$('#email-invitatio-alert-box').removeClass('hidden');
			});
			send = false;
		}
			_.each(Meteor.user().emails,function(email){
				console.log(email);
				if(email.address == friend){
					emailError = "you cant invite yourself";
					emailErrorDep.changed();
					Deps.afterFlush(function(){
						$('#email-invitatio-alert-box').removeClass('hidden');
					});
					send = false;
				}
			});
		if(send){
			Meteor.call('sendMail',friend,function(err,res){
				console.log(res);
				if(res == 1){
					emailError = "user already exists";
					emailErrorDep.changed();
					Deps.afterFlush(function(){
						$('#email-invitatio-alert-box').removeClass('hidden');
					});
				}else{
					closeInviteEmailModal();
				}
				
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

				Deps.afterFlush(function(){
					$('#alert_placeholder').html('');
				});
			},4000);					
	}
}	

Template.friends.events({
	'click #search-button' : function(){
		Meteor.call('searchForUser',$('#search-for-friend').val(),function(err,res){
			bootstrap_alert.warning(res);
		});
	}
});

Template.friends.helpers({
	'result' : function(){

		emailPhraseDep.depend();
		changeRulesDep.depend();
		keyPressedDep.depend();

		if(keyPressed){
			if(emailFound){
				var result =[{"username" : userFoundName,_id : userId,avatar:userAvatar}];
				return result;
			}else{
				var result =[] ;
				Usernames.find().forEach(function(user){
					if(user.username.indexOf(phrase)>-1){
						result.push(user);
					}
				});
				result = result.sort();
				result = _.first(result,5);
				return result;
			}
		}
	},
	'online' : function(){
		console.log(this);
		return this.state == "online";
	},
	'friends': function(){
		friendsFilterDep.depend();
		if(!Meteor.user())
			return;
		return friendsArray;
	},
	'facebookFriends' : function(){
		if(Meteor.user().services.facebook){
			Meteor.call("getFacebookFriendsNames",function(err,res){
				return res;			
			});
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

Template.invite_facebook_modal.events({
	'click .close' : function(){
		closeInviteFacebookModal();
	}
});

Template.invite_facebook_modal.helpers({
	'inviteFacebookModalClass' : function(){
		inviteFacebookModalClassDep.depend();
		return inviteFacebookModalClass;
	}
});

Template.facebook_friends.events({
	'click .invite-button' : function(){
		var self = this;
		if(!FB){
			fbSdkLoader();
		}else{
			console.log("here");
			FB.getLoginStatus(function(response) {
				console.log("response");
				console.log(response);
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
	}

});
Template.facebookConnectModal.events({
	'click .confirm-facebook': function(){
      Meteor.call('getFacebookCode',function(err,res){
      	console.log("res");
      	console.log(res);
      	closeConnectFacebookModal();
        var x = screen.width/2 - 700/2;
        var y = screen.height/2 - 450/2;
        window.location.replace(res);
      }); 
	},
	'click .close' : function(){
		closeConnectFacebookModal();
	}
});

Template.facebookConnectModal.helpers({
	conntectFacebookModalClass : function(){
		conntectFacebookModalClassDep.depend();
		return conntectFacebookModalClass;
	}
});
var fbSdkLoader = function() {
	if(!Session.get("is Facebook JDK loaded?")) { // Load Facebook JDK only once.
		Session.set("is Facebook JDK loaded?", true);
		window.fbAsyncInit = function() { // See Facebook JavaScript JDK docs at: https://developers.facebook.com/docs/reference/javascript/
	// Init the FB JS SDK
		var initConfig = {
			appId: '525727080873464', // App ID from the App Dashboard
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