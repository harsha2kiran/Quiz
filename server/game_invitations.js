Meteor.publish('myInvitations',function(user){
	return Invitations.find({$or : [{invited:user},{invitator:user}]});
});

Meteor.startup(function(){
	Invitations.find().forEach(function(inv){
		Invitations.remove({_id:inv._id});
	});
});

Meteor.methods({
	'game-invite':function(invited,category){
		var invited = Meteor.users.findOne({username: invited}); 
		var invitation;
		if(!invited){
			return 1;
		}if(invited.state == "busy"){
			return 2;
		}if(invited.state == "offline"){
			return 3;
		}
		var invitation = {
			'invitator' : Meteor.userId(), 
			'invitatorName' : Meteor.users.findOne({_id:Meteor.userId()}).username,
			'invited' : invited._id,
			'category' : category,
			'state' : 'waiting'
		};
		if(invitation.invitator == invitation.invited){
			return 4;
		}
		Invitations.insert(invitation); 
		Meteor.call('setUserState',"busy",invitation.invited);
		Meteor.call('setUserState',"busy",invitation.invitator);
	}, 
	'rejectInvitation': function(inv){
		Invitations.update({_id:inv},{$set:{state: 'rejected'}}); 
		var invitation = Invitations.findOne({_id:inv});
		var current = Invitations.findOne({_id:inv});
		Meteor.call('setUserState',"online",invitation.invited);
		Meteor.setTimeout(function(){
			Invitations.remove({_id:inv});
			Meteor.call('setUserState',"online",invitation.invitator);
		},3000);
	}, 
	'acceptInvitation' : function(inv){
		Invitations.update({_id:inv},{$set:{state: 'accepted'}}); 
		Meteor.setTimeout(function(){
			Invitations.remove({_id:inv});
		},3000);
	}
})