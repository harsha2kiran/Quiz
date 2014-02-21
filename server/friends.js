Meteor.publish('friends',function(){
	if(this.userId){
		var user = Meteor.users.findOne({_id:this.userId});
		var self = this;
		var handle = Meteor.users.find().observeChanges({
			added : function(id,friend){
				if(_.contains(user.friends,id)){
					self.added('friends',id,{"username":friend.username,"state":friend.state});
				}
			},
			changed : function(id,field){
				if(field.friends){
					var friend = Meteor.users.findOne({_id:id});
					if(_.contains(friend.friends,user._id)){
						self.added('friends',id,{"username":friend.username,"state":friend.state});
					}	
				}
				if(field.state){
					var friend = Meteor.users.findOne({_id:id});
					if(_.contains(friend.friends,user._id)){
						self.changed('friends',id,{"username":friend.username,"state":friend.state});
					}	
				}		
			}
		});
		self.ready();
	}else{
		console.log("waiting");
		this.ready();
	}
});



Meteor.publish('usernames',function(){
	if(this.userId){
		var user = Meteor.users.findOne({_id:this.userId});
		var self = this;
		var handle = Meteor.users.find().observeChanges({
			added : function(id,user){
				self.added('usernames',id,{"username":user.username,"avatar" : user.avatar});
			},
		});
		self.ready();
	}
});

Meteor.methods({
	'emailExists' : function(phrase) {
		var result = null;
		Meteor.users.find().forEach(function(user){
			_.each(user.emails,function(mail){
				console.log(mail);
				console.log(phrase);
				if(mail.address == phrase){
					console.log("ok");
					result = {"userId" : user._id, "avatar": user.avatar};
				}
			});
		});
		return result;
	}
});