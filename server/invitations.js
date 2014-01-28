Meteor.publish('myInvitations',function(user){
	return Invitations.find({$or : [{invited:user},{invitator:user}]});
});

Meteor.startup(function(){
	Invitations.find().forEach(function(inv){
		Invitations.remove({_id:inv._id});
	});
});

Meteor.methods({
	'invite':function(invited){
		var invited = Meteor.users.findOne({username: invited}); 
		var invitation;
		if(!invited){
			return 1;
		}
		var invitation = {
			'invitator' : Meteor.userId(), 
			'invited' : invited._id,
			'category' : 'category',
			'state' : 'waiting'
		};
		Invitations.insert(invitation); 
	}, 
	'rejectInvitation': function(inv){
		Invitations.update({_id:inv},{$set:{state: 'rejected'}}); 
		Meteor.setTimeout(function(){
			console.log("remove inv");
			Invitations.remove({_id:inv});
		},4000);
	}
})