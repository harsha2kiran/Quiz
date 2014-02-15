Meteor.startup(function(){
	Deps.autorun(function(){
		Meteor.subscribe("messages");
	});
});

Template.navbar.helpers({
	is_admin: function() {
		if (!Meteor.user())
			return;
		return (Meteor.user().isAdmin || Meteor.user().isModerator);
	},
	username: function() {
		if (Meteor.user())
			return Meteor.user().username;
	},
	points: function() {
		if (Meteor.user().stats){
			return Meteor.user().stats.points.all;
		}
	},
	numberOfUnread : function(){
		var counter =0;
		Messages.find().forEach(function(message){
			if(message.state == "unread"){
				counter ++;
			}
		});
		return counter;
	},
	title : function(){
		return this.title;
	},
	unread : function(){
		return this.state == "unread";
	},
	messages: function(){
		return Messages.find();
	}
});

Template.navbar.events({
	'click .message' : function(){
		Session.set('currentlySelectedMessage',this);
		$('#notifications_modal').modal('show');
		Meteor.call('readMessage',this._id);
	},
	'click .logout': function() {
		Meteor.logout();
	}, 
	'click .quick': function(){
		$('#quick-game-modal').modal('show');
	}, 
	'click .friends': function(){
	},

});
Template.notificationsModal.events({
	'click ':function(){
		console.log("clicked");
	},
	'click #friendRequestAccept' : function(){
		Meteor.call('makeFriends',this.sender,this.recipient);
		$('#notifications_modal').modal('hide');
		Meteor.call('reply',this._id);
		var self = this;
		Meteor.call('getUserName',this.recipient,function(err,res){
			var sender = self.recipient;
			var recipient = self.sender;
			var name = res;
			var message = "user " + name + " accepted your friend request ";
			var title = "friend request accepted";
			Meteor.call('sendInternalMessage',sender,recipient,title,message);
		});
	},
	'click #friendRequestReject' : function(){
		$('#notifications_modal').modal('hide');
		var self = this;
		Meteor.call('reply',this._id);
		Meteor.call('getUserName',this.recipient,function(err,res){
			var sender = self.recipient;
			var recipient = self.sender;
			var name = res;
			var message = "user " + name + " rejected your friend request ";
			var title = "friend request rejected";
			Meteor.call('sendInternalMessage',sender,recipient,title,message);
		});
	}
});


Handlebars.registerHelper('isFriendRequest',function(){
	return this.sender != "system" && this.title !="friend requested rejected" 
	&& this.title !="friend request accepted" && this.state!="replied"; 
});
Handlebars.registerHelper('message',function(){
	return Session.get('currentlySelectedMessage');	
});