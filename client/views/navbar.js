Meteor.startup(function(){
	Deps.autorun(function(){
		Meteor.subscribe("messages");
	});
	Session.set("notificationModalVisible",false);
});

Template.navbar.helpers({
	is_busy: function(){
		if (!Meteor.user())
			return;
		return Meteor.user().state == "busy";
	},
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
		var messagesArray = Messages.find().fetch();
		messagesArray.sort(function(a,b){
			return ((a.state == "read" && b.state == "unread") || 
					(a.state == "replied" 	  && b.state == "unread") || 
					(a.state == "replied" && b.state == "read"));
		});
		return messagesArray;
	}
});

Template.navbar.events({
	'click #mes-button' : function(evt){
		var counter =0;
		Messages.find().forEach(function(message){
			counter ++;
		});
		if(counter == 0){
			evt.stopPropagation();
			evt.stopImmediatePropagation();
		}
	},
	'click .busy' : function(evt){
		console.log(Quizzes);
		Session.set("currently_clicked",evt.target.name);
		$('#confirm_break_game').addClass('modalActive');
		$('#confirm_break_game').removeClass('modalHidden');

	},
	'click .message' : function(){
		Session.set('currentlySelectedMessage',this);
		Session.set("notificationModalVisible",true);
		console.log('this'); 
		console.log(this._id);
		Meteor.call('readMessage',this._id);
	},
	'click .logout': function() {
		Meteor.logout(function(){
			userDep.changed();
			console.log("afterlogut");
			console.log(Meteor.userId());
		});
	}, 
	'click .quick': function(){
		Session.set("invitedFriend","");
		quickGameModalClass = 'modalActive';
		quickGameModalClassDep.changed();
	}, 
	'click .friends': function(){
	},

});

Template.notificationsModal.helpers({
	'notificationModalVisible' : function(){
		return Session.get('notificationModalVisible');
	}
});
Template.notificationsModal.events({

	'click #friendRequestAccept' : function(){
		Meteor.call('makeFriends',this.sender,this.recipient);
		Session.set("notificationModalVisible",false);
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
		Session.set("notificationModalVisible",false);
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
	},
	'click .close' : function(){
		Session.set("notificationModalVisible",false);
	}
});
Template.confirm_game_break.events({
	'click #break-game':function(){
		$('#confirm_break_game').addClass('modalHidden');
		$('#confirm_break_game').removeClass('modalActive');
		if(Session.get("currently_clicked")!="logout"){
			Router.go(Session.get("currently_clicked"));
		}else{
			Meteor.logout(function(){
				userDep.changed();
			});
		}
		
	},
	'click #stay-in-game' : function(){
		console.log("test");
		$('#confirm_break_game').addClass('modalHidden');
		$('#confirm_break_game').removeClass('modalActive');
	}
});

Handlebars.registerHelper('isFriendRequest',function(){
	return this.sender != "system" && this.title !="friend request rejected" 
	&& this.title !="friend request accepted" && this.state!="replied"; 
});
Handlebars.registerHelper('message',function(){
	return Session.get('currentlySelectedMessage');	
});