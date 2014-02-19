var initialize = false;

Meteor.publish('hallOfFame', function(){
	var self = this;  
	var handle = Meteor.users.find().observeChanges({
		added : function(id,user){
			self.added("hallOfFameData",id,{"badges":user.badges,"avatar":user.avatar,"username":user.username,"stats" : user.stats});	
		}
	}); 
	self.ready();
});

