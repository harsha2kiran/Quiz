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
					console.log(id);
					console.log(field.state);
					var friend = Meteor.users.findOne({_id:id});
					if(_.contains(friend.friends,user._id)){
						self.changed('friends',id,{"username":friend.username,"state":friend.state});
					}	
				}		
			}
		});
		self.ready();
	}
});
