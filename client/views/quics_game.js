
var NOT_FOUND = 1 ;
var BUSY = 2;
var res = ""; 
var resDep = new Deps.Dependency;

invitationDep = new Deps.Dependency();

Meteor.startup(function(){
	Deps.autorun(function(){
		if(Meteor.user()){
			Meteor.subscribe('myInvitations',Meteor.user()._id);			
		}
	});
	var query = Invitations.find();
	var handle = query.observeChanges({
		added: function(id,inv){
			invitationDep.changed();
			if(inv.invited = Meteor.user()._id){
				$('#quick-game-modal').modal('show');
			}
		}, 
		changed: function(id,inv){
			invitationDep.changed();
		},
		removed: function(id,inv){
			$('#quick-game-modal').modal('hide');
		}
	});
});

Template.quick_game.events({
	'click #invite': function(){
		var input = $('.invite'); 
		Meteor.call('invite',input.val(),function(err,result){
			switch(result){
				case NOT_FOUND:
					res = "User Not Found"
					resDep.changed();
					break; 
				case BUSY:
					res = "User are busy at the moment"
					resDep.changed();
					break; 
			} 
		});
	}
});

Template.quick_game_modal_body.helpers({
	'categories_that_can_be_quizzed': function() {
		console.log(Categories.find({ questionCount: {$gte: 5 }}));
		return Categories.find({ questionCount: {$gte: 5 }});
	},
	'communique' : function(){
		resDep.depend();
		return res;
	},
	'invited' : function(){ 
		if(Invitations.findOne())
			return Invitations.findOne().invited == Meteor.user()._id;
		return false;
	}, 
	'rejected' : function(){
		if(Invitations.findOne())
			return Invitations.findOne().state == 'rejected';
		return false;
	},
	'invitation': function(){
		if(Invitations.findOne()){
			return true;
		}
		return false;
	}, 
	'waiting': function(){
		return Invitations.findOne().state == "waiting";
	}, 
	'busy':function(){
		return false;
	}, 
	'notFound':function(){
		return false;
	}
}); 



Template.quick_game_modal_body.events({
	'click #reject' : function(){
		Meteor.call('rejectInvitation',Invitations.findOne({})._id,function(err,recponse){
			$('#quick-game-modal').modal('hide');			
		});
	}
});