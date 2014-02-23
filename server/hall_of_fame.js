var initialize = false;

Meteor.publish('hallOfFame', function(){
	var self = this;  
	var handle = Meteor.users.find().observeChanges({
		added : function(id,user){
			self.added("hallOfFameData",id,{"badges":user.badges,"avatar":user.avatar,"username":user.username,"stats" : user.stats});	
		},
		changed : function(id,field){
			console.log("field");
			console.log(field);
			if(field.stats){
				self.changed("hallOfFameData",id,{"stats":field.stats});
			}if(field.avatar){
				self.changed("hallOfFameData",id,{"avatar":field.avatar});
			}if(field.username){
				self.changed("hallOfFameData",id,{"username":field.username});
			}
		}
	}); 
	self.ready();
});

