var NOT_FOUND = 1 ;
var BUSY = 2;
var OFFLINE = 3;
var SELF_INVITE =4;
var res = ""; 
var resDep = new Deps.Dependency;
var choosenCategory = "choose category";
var categoryDep = new Deps.Dependency;

invitationDep = new Deps.Dependency();

quickGameDep = new Deps.Dependency();
  
Meteor.startup(function(){
	Deps.autorun(function(){
		if(Meteor.user()){
			Meteor.subscribe('myInvitations',Meteor.user()._id);			
		}
	});
	var query = Invitations.find();
	var handle = query.observeChanges({
		added: function(id,inv){
			console.log("inv added");
			console.log(id);
			console.log(inv.invited);
			console.log(inv.invitator);
			invitationDep.changed();
			choosenCategory = inv.category;
			console.log(inv);
			categoryDep.changed(); 
			if(inv.invited = Meteor.user()._id){
				console.log("to ja");
				Deps.afterFlush(function(){
					$('#quick-game-modal').removeClass('modalHidden');
					$('#quick-game-modal').addClass('modalActive');
				});
				Meteor.setTimeout(function(){
					var inv = Invitations.findOne({});
					if(inv){
						if(inv.state != "accepted" && inv.invited == Meteor.user()._id){
							$('#quick-game-modal').removeClass('modalActive');
							$('#quick-game-modal').addClass('modalHidden');	
							Meteor.call('rejectInvitation',Invitations.findOne({})._id,function(err,recponse){		
							});		
						}
					}		
				},30000);
			}
		}, 
		changed: function(id,inv){
			console.log("inv");
			console.log(inv);
			if(inv.state == 'accepted'){
				var id = Categories.findOne({name:choosenCategory})._id;
				var quiz = '/lobby/'+id;
				console.log(Router._currentController.path.indexOf("/lobby"));
				if(Router._currentController.path.indexOf("/lobby")>-1){
					$('#quick-game-modal').removeClass('modalActive');
					$('#quick-game-modal').addClass('modalHidden');
					quickGameDep.changed();
				}else{
					$('#quick-game-modal').removeClass('modalActive');
					$('#quick-game-modal').addClass('modalHidden');
					Router.go(quiz);
				}
			}
		},
		removed: function(id,inv){
			Meteor.setTimeout(function(){
				$('#quick-game-modal').removeClass('modalActive');
				$('#quick-game-modal').addClass('modalHidden');
			},3000);
		}
	});
});

Template.quick_game.events({
	'click #closeQuickGameModal' : function(){
			console.log("test");
			$('#quick-game-modal').addClass('modalHidden');
			$('#quick-game-modal').removeClass('modalActive');	
	},

	'click #game-invite': function(){
		Session.set("invitedFriend",$('.invite').val());
		var input = $('.invite'); 
		if(choosenCategory == "choose category"){
			res = "please choose category";
			resDep.changed();
	    	Deps.afterFlush(function(){
	    		$("#game-invite-alert-box").removeClass('hidden');
	    	});
		}else{
			Meteor.call('game-invite',input.val(),choosenCategory,function(err,result){
				switch(result){
					case NOT_FOUND:
						res = "User Not Found"
						resDep.changed();
				    	Deps.afterFlush(function(){
	    					$("#game-invite-alert-box").removeClass('hidden');
	    				});
						break; 
					case BUSY:
						res = "User are busy at the moment"
						resDep.changed();
				    	Deps.afterFlush(function(){
	    					$("#game-invite-alert-box").removeClass('hidden');
	    				});
						break; 
					case OFFLINE:
						res = "User are offline"
						resDep.changed();
				    	Deps.afterFlush(function(){
	    					$("#game-invite-alert-box").removeClass('hidden');
	    				});
						break; 				
					case SELF_INVITE:
						res = "You cant invite yourself"
						resDep.changed();
				    	Deps.afterFlush(function(){
	    					$("#game-invite-alert-box").removeClass('hidden');
	    				});
						break; 			
				} 
			});			
		}

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
			quickGameDep.changed();
			Meteor.call('acceptInvitation',Invitations.findOne({})._id,function(err,res){
				
			});
		});
	},
	'click .category' : function(evt){
		Session.set("invitedFriend",$('.invite').val());
		choosenCategory =  $(evt.target)[0].text; 
		categoryDep.changed();
	},	
	'click #dropdown-button' : function(){
		
	},
	'click #reject' : function(){
		Meteor.call('rejectInvitation',Invitations.findOne({})._id,function(err,recponse){
			$('#quick-game-modal').removeClass('modalActive');
			$('#quick-game-modal').addClass('modalHidden');			
		});
	},

});