Meteor.publish('myInvitations',function(){
	return Invitations.find({$or : [{invited:this.userId},{invitator:this.userId}]});
});

Meteor.startup(function(){
	Invitations.find().forEach(function(inv){
		Invitations.remove({_id:inv._id});
	});
});

Meteor.methods({
	'game-invite':function(invited,category){
		var invited = Meteor.users.findOne({username: invited}); 
		var cat = Categories.findOne({name: category});
		var invitation;
		if(!invited){
			return 1;
		}if(invited.state == "busy"){
			return 2;
		}if(invited.state == "offline"){
			return 3;
		}
		var waitingForAccept;
		Invitations.find().forEach(function(inv){
			if(inv.invited == invited._id && inv.invitator == Meteor.userId()){
				waitingForAccept  = true;
			}
		});
		if(waitingForAccept){
			return 5;
		}
		var invitation = {
			'invitator' : Meteor.userId(), 
			'invitatorName' : Meteor.users.findOne({_id:Meteor.userId()}).username,
			'invitedName' : Meteor.users.findOne({_id:invited._id}).username,
			'invited' : invited._id,
			'category' : category,
			'categoryId' : cat._id,
			'state' : 'waiting'
		};
		if(invitation.invitator == invitation.invited){
			return 4;
		}
		Invitations.insert(invitation); 
	}, 
	'rejectInvitation': function(inv){
		Invitations.update({_id:inv},{$set:{state: 'rejected'}},function(){

		});
		Meteor.setTimeout(function(){
			Invitations.remove({_id:inv});
		},2000); 
	}, 
	'acceptInvitation' : function(inv,cat){
		var invitation = Invitations.findOne({_id:inv});
		console.log("invitation");
		console.log(invitation);
		var invitator = Meteor.users.findOne({_id:invitation.invitator});
		var invited = Meteor.users.findOne({_id:invitation.invited});
		var newLobby = Lobbys.insert({
			categoryId: cat,
			players: [
				{
					username: invitator.username,
					userId: invitator._id
				},
				{
					username: invited.username,
					userId: invited._id
				}
			],
			playerCount: 2,
			playing: true
		},function(){
			Quiz.createNewQuiz(cat, newLobby);
			Invitations.update({_id:inv},{$set:{state: 'accepted'}},function(){
				//reject all pending invitation sent to me
				Invitations.find({invited: invited._id}).forEach(function(inv){
					Meteor.call('rejectInvitation',inv._id);
				});
				//remove all invitations that i sent
				Invitations.find({invitator: invited._id}).forEach(function(inv){
					Invitations.remove({_id:inv._id});
				});
				Meteor.setTimeout(function(){
					Invitations.remove({_id:inv});
				},300);
			}); 
		});
	}
})