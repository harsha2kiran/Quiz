Meteor.publish('hallOfFame', function(){
	var self = this;  
	Meteor.users.find().forEach(function(user){
		self.added("hallOfFameData",user._id,{"username":user.username,"stats" : user.stats});
	});
 	self.ready();
});
