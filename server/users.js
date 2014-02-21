Accounts.config({sendVerificationEmail: true, forbidClientAccountCreation: false});

Accounts.onCreateUser(function(options, user) {
	//first user is Admin
	if (Meteor.users.find({}).count() === 0) {
		user.isAdmin = true;
	}
	user.avatar = "/empty.jpg";
	user.friends = [];
	user.stats = {
		'points' : {
			'all'   : 0, 
			'day'   : 0, 
			'week'  : 0,
			'month' : 0,
			'year'  : 0			
		},
		'wins' : {
			'all'   : 0, 
			'day'   : 0, 
			'week'  : 0,
			'month' : 0,
			'year'  : 0			
		},
		'answers' : {
			'all'   : 0, 
			'day'   : 0, 
			'week'  : 0,
			'month' : 0,
			'year'  : 0			
		},
		'ties' :{
			'all'   : 0, 
			'day'   : 0, 
			'week'  : 0,
			'month' : 0,
			'year'  : 0			
		},
		'defeats' :{
			'all'   : 0, 
			'day'   : 0, 
			'week'  : 0,
			'month' : 0,
			'year'  : 0			
		},
	}

	if(user.services.facebook){
		Meteor.call('checkUserFriends',user);
	}
	return user;
});

Meteor.publish('currentUser', function() {
	//this is necessary so a user will get the isAdmin field if they are
	//XX remove services exclusion once we add them
	return Meteor.users.find(this.userId, { services: 0, createdAt: 0 });
});

//all users are published to an admin
Meteor.publish('allUsers', function() {
	 if (this.userId && Users.isAdmin(this.userId)){
		return Meteor.users.find();
	 }
});


Meteor.methods({
	searchForUser : function(input){
		var result = 3;
		var recipient = null;
		if(Meteor.user().username == input ||  _.contains(Meteor.user().emails.address,input)){
			return 4;
		}
		Meteor.users.find().forEach(function(user){
			if(user.username == input || _.contains(user.emails.address,input)){
				recipient = user;
				if(_.contains(Meteor.user().friends,user._id)){
					result=1;
				}
				else if(_.contains(Meteor.user().requested,user._id)){
					result=2;
				}else{
					result=0;
				}
				return;
			}
		});

		if(!result){
			var sender = Meteor.user()._id;
			var recipient = recipient._id;
			var message = "user " + Meteor.user().username + " send you friend request ";
			var title = "friend request";
			Meteor.call('sendInternalMessage',sender,recipient,title,message);
		}
		return result;
		
	},
	doUserHaveSocialServices : function(username){
		
		var user = Meteor.users.findOne({username:username}); 
		if(user){
			if(user.services.twitter){
				return "twitter";
			}
			if(user.services.google){
				return "google";
			}
			if(user.services.facebook){
				if(!user.services.facebook.forInvite){
					return "facebook";
				}
			}
		}
		return false;
	},
	getUserName : function(id){
		return Meteor.users.findOne({_id:id}).username;
	},
	setUserName : function(name){
		var found = false;
		Meteor.users.find().forEach(function(user){
			if(user.username == name){
				found = true;
			}
		});
		if(!found)
			Meteor.users.update({_id:this.userId},{$set:{username:name}});
		return found;
	},
	setUserMissingData : function(name,email){
		var id = Meteor.user()._id;

		var result = {};
		if(!Meteor.user().username)
			result['usernameFound'] = false;
		if(!Meteor.user().emails)
			result['emailFound'] = false;
		Meteor.users.find().forEach(function(user){
			if(result.hasOwnProperty('usernameFound')){

				if(user.username == name){
					result['usernameFound'] = true;
				}
			}
			if(result.hasOwnProperty('emailFound')){
				if(user.emails){
					_.each(user.emails,function(mail){
						if(mail.address == email){
							result['emailFound'] = true;
						}
					});
				}
			}
		});
		if(!result['usernameFound'] && !result['emailFound']){
			var emails = []; 
			emails[0] = {'address' : email, 'verified' : false};
			var update = {
				'username' : name,
				'emails' : emails,
			}
			var self = this;

			Meteor.users.update({_id:id},{$set: update},function(){
				Accounts.sendVerificationEmail(self.userId);
			});
		}
		console.log(result);
		return result;
	},
	setUserState : function(state,userId){

		Meteor.users.update({_id:userId},{$set:{state:state}});
	},
	makeAdmin: function(newAdminUserId) {
		check(newAdminUserId, String)
		if (!Users.isAdmin(this.userId))
			throw new Meteor.Error(500, "Only admins can do this");

		Meteor.users.update(newAdminUserId, {
			$set: { isAdmin: true }
		});
	},
	revokeAdmin: function(revokeUserId) {
		check(revokeUserId, String);

		if (!Users.isAdmin(this.userId))
			throw new Meteor.Error(500, "Only admins can do this");

		if (revokeUserId === this.userId)
			throw new Meteor.Error(500, "You can't remove admin from yourself");

		Meteor.users.update(revokeUserId, {
			$set: { isAdmin: false }
		});
	},
	makeModerator: function(newAdminUserId) {
		check(newAdminUserId, String)

		if (!Users.isAdmin(this.userId))
			throw new Meteor.Error(500, "Only admins can do this");

		Meteor.users.update(newAdminUserId, {
			$set: { isModerator: true }
		});
	},
	revokeModerator: function(revokeUserId) {
		check(revokeUserId, String);

		if (!Users.isAdmin(this.userId))
			throw new Meteor.Error(500, "Only admins can do this");

		if (revokeUserId === this.userId)
			throw new Meteor.Error(500, "You can't remove admin from yourself");

		Meteor.users.update(revokeUserId, {
			$set: { isModerator: false }
		});
	},
	changeUserPassword: function(changedUsersId, newPassword) {
		check(changedUsersId, String);
		check(newPassword, String);

		if (!Users.isAdmin(this.userId))
			throw new Meteor.Error(500, "Only admins can do this");

		Accounts.setPassword(changedUsersId, newPassword);
	},
	deleteUser: function(deletedUserId) {
		check(deletedUserId, String);

		if (!Users.isAdmin(this.userId))
			throw new Meteor.Error(500, "Only admins can do this");

		if (this.userId === deletedUserId)
			throw new Meteor.Error(500, "You cannot delete yourself");

		Meteor.users.remove(deletedUserId);
	}, 
	updateStats: function(userId,stat,amount){

		var user = Meteor.users.findOne({_id:userId}); 

		var update = {};
		for(var period in user.stats[stat]){
			var key = 'stats.'+stat+'.'+period; 
			update[key] = user.stats[stat][period]+amount; 
		}
				
		Meteor.users.update(userId, {$set: update});
	}, 
	makeFriends: function(first,second,oneWay){
		if(oneWay){
			Meteor.users.update({_id:first},{$push:{friends: second}}); 	
		}else{
			Messages.find().forEach(function(message){
				if(message.title == "friend request" && 
					((message.sender == first && message.recipient == second)
					|| (message.sender == second && message.recipient == first))){
					Meteor.call('readMessage',message._id);
					Meteor.call('reply',message._id);
				}
			});

			Meteor.users.update({_id:first},{$push:{friends: second}}); 
			Meteor.users.update({_id:second},{$push:{friends: first}}); 			
		}
	},
	makeUser : function(user) {
	    var usernameExists = Meteor.users.findOne({username:user.username});
	    var emailExists = Meteor.users.findOne({email:user.email});
	    if(usernameExists){
	      	return 1;
	    }else if(emailExists){
	      	return 2;
	    }else{
      		return 0;
	    }
 	}
});

Users = {};

Users.isAdmin = function(userId) {
	var user = Meteor.users.findOne(userId);
	return user.isAdmin;
}

Users.isModerator = function(userId) {
	var user = Meteor.users.findOne(userId);
	return user.isModerator;
}