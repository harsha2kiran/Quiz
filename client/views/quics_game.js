
var NOT_FOUND = 1 ;
var BUSY = 2;
var res = ""; 
var resDep = new Deps.Dependency;
var choosenCategory = "choose category";
var categoryDep = new Deps.Dependency;

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
			choosenCategory = inv.category;
			categoryDep.changed(); 
			if(inv.invited = Meteor.user()._id){
				$('#quick-game-modal').removeClass('modalHidden');
				$('#quick-game-modal').addClass('modalActive');
			}
		}, 
		changed: function(id,inv){
			if(inv.state == 'accepted'){

				var quiz = '/lobby/'+Categories.findOne({name:choosenCategory})._id;
				
				Router.go(quiz);
				
			}
		},
		removed: function(id,inv){
	
		}
	});
});

Template.quick_game.events({
	'click #closeQuickGameModal' : function(){
			console.log("test");
			$('#quick-game-modal').addClass('modalHidden');
			$('#quick-game-modal').removeClass('modalActive');	
	},
	'click #test' : function(){
		$('.invite').wysihtml5();
	},
	'click #invite': function(){
		var input = $('.invite'); 
		Meteor.call('invite',input.val(),choosenCategory,function(err,result){
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
	'userInvited' : function(){
		return	Session.get("invitedFriend");
	},
	'category' : function(){
		categoryDep.depend();
		return choosenCategory; 
	},
	'categories_that_can_be_quizzed': function() {
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
	}, 
	'invitator' : function(){
		if(Invitations.findOne())
			return Invitations.findOne().invitatorName;
	}
}); 



Template.quick_game_modal_body.events({
	'click #accept' : function(){
		var cateogryId = Categories.findOne({name:choosenCategory})._id;
		var pl1 = Invitations.findOne().invitator; 
		var pl2 = Invitations.findOne().invited;
			$('#quick-game-modal').removeClass('modalActive');
			$('#quick-game-modal').addClass('moadlHidden');		
		Meteor.call('quickGame',cateogryId,pl1,pl2,function(err,response){
			Meteor.call('acceptInvitation',Invitations.findOne({})._id);
		});
	},
	'click .category' : function(evt){
		choosenCategory =  $(evt.target)[0].text; 
		categoryDep.changed();
	},	
	'click #reject' : function(){
		Meteor.call('rejectInvitation',Invitations.findOne({})._id,function(err,recponse){
			$('#quick-game-modal').removeClass('modalActive');
			$('#quick-game-modal').addClass('moadlHidden');			
		});
	}
});