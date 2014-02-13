Meteor.publish("messages",function(){
	console.log("in publish");
	console.log(this.userId);
	return Messages.find({recipient:this.userId});
});

Meteor.methods({
	'sendInternalMessage' : function(sender,recipient,title,content){
			if(arguments.length == 4){
				var message = {'sender': sender, 'title': title, 'content' : content, 'recipient' :recipient,'state':'unread' }		
				Messages.insert(message);
				console.log(Messages.find().fetch());
				Meteor.users.update({_id:sender},{$push:{requested:recipient}});
			}
	}, 
	'readMessage' : function(id){
		Messages.update({_id:id},{$set:{state: 'read'}});
	}
});
