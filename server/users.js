Accounts.config({sendVerificationEmail: true, forbidClientAccountCreation: false});

Accounts.onCreateUser(function(options, user) {
	//first user is Admin
	if (Meteor.users.find({}).count() === 0) {
		user.isAdmin = true;
	}
	
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
	}
	console.log("user created");
	console.log(user);
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
	 if (this.userId && Users.isAdmin(this.userId)) 
	 	console.log(Meteor.users.find().fetch());
		return Meteor.users.find();
});

Meteor.methods({
	makeAdmin: function(newAdminUserId) {
		check(newAdminUserId, String)
		console.log(this.userId);
		console.log(Users.isAdmin(this.userId));
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