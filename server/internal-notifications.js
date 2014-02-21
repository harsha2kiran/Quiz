Meteor.publish("messages",function(){
	return Messages.find({recipient:this.userId},{$sort:{state: -1}});
});

Meteor.methods({
	'sendInternalMessage' : function(sender,recipient,title,content){
			if(arguments.length == 4){
				var message = {'sender': sender, 'title': title, 'content' : content, 'recipient' :recipient,'state':'unread' }		;
				var userSender = Meteor.users.findOne({_id:sender});
				if(sender != "system"){
					if(_.contains(userSender.requested,recipient)){
			
					}else{
						Messages.insert(message);
						Meteor.users.update({_id:sender},{$push:{requested:recipient}});
						Meteor.users.update({_id:recipient},{$push:{invitators:sender}});
					}

				}else{
					Messages.insert(message);
				}
				
			}
	}, 
	'readMessage' : function(id){
		if(Messages.findOne({_id:id}).state != 'replied'){
			Messages.update({_id:id},{$set:{state: 'read'}});
		}
	},
	'reply' : function(id){

		Messages.update({_id:id},{$set:{state: 'replied'}});
	}
});

Meteor.methods({
	'sendFriendRequest' : function(invitator,requested){
		var message = "user " + Meteor.user().username + " send you friend request ";
		var title = "friend request";
		Meteor.call('sendInternalMessage',invitator,requested,title,message);		
	}
})
