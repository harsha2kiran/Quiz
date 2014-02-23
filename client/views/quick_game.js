var NOT_FOUND = 1 ;
var BUSY = 2;
var OFFLINE = 3;
var SELF_INVITE =4;
var WAITING =5;
var res = ""; 
var resDep = new Deps.Dependency;
var choosenCategory = "choose category";
var categoryDep = new Deps.Dependency;
var shouldBeClose = false;
quickGameModalClass = 'modalHidden';
quickGameModalClassDep = new Deps.Dependency();
invitationDep = new Deps.Dependency();

quickGameDep = new Deps.Dependency();
  
Meteor.startup(function(){
	Deps.autorun(function(){
		if(Meteor.user()){
			Meteor.subscribe('myInvitations');			
		}
	});
	var query = Invitations.find();
	var handle = query.observe({
		added: function(inv){

			choosenCategory = inv.category;

			if(inv.invited = Meteor.user()._id){
				Deps.afterFlush(function(){
					quickGameModalClass = 'modalActive';
					quickGameModalClassDep.changed();
				});
				Meteor.setTimeout(function(){
					var inv = Invitations.findOne({});
					if(inv){
						if(inv.state != "accepted" && inv.invited == Meteor.user()._id){
								quickGameModalClass = 'modalHidden';
								quickGameModalClassDep.changed();
							Meteor.call('rejectInvitation',Invitations.findOne({})._id,function(err,recponse){		
							});		
						}
					}		
				},30000);
			}
		}, 
		changed: function(newDoc,oldDoc){
			console.log('old');
			console.log(oldDoc);
			console.log('new');
			console.log(newDoc);
			if(newDoc.state == 'accepted'){
				var id = Categories.findOne({name:choosenCategory})._id;
				var quiz = '/lobby/'+id;
				console.log('quiz');
				console.log(quiz);
				console.log(Router._currentController.path.indexOf("/lobby"));
				if(Router._currentController.path.indexOf("/lobby")>-1){
					quickGameModalClass = 'modalHidden';
					quickGameModalClassDep.changed();
					Router.go('/');
					Meteor.setTimeout(function() {
						Router.go(quiz);
					},100);

				}else{
					quickGameModalClass = 'modalHidden';
					quickGameModalClassDep.changed();
					Router.go('/');
					Meteor.setTimeout(function() {
						Router.go(quiz);
					},100);
				}
			}
		},
		removed: function(doc){
			if(shouldBeClose){
				if(Invitations.find().fetch().length == 0) {
					quickGameModalClass = 'modalHidden';
					quickGameModalClassDep.changed();
				}	
			}
		}
	});
});

Template.quick_game.events({
	'click #closeQuickGameModal' : function(){
		quickGameModalClass = 'modalHidden';
		quickGameModalClassDep.changed();
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
					case WAITING:
						res = "currently invitated, please wait"	
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
	'invitationsSendToMe' : function(){
		if(Invitations.findOne()){
			console.log("invitations");
			console.log(Invitations.find({invited:Meteor.user()._id}))
			return Invitations.find({invited:Meteor.user()._id});
		}
		return null;
	},
	'invitationSent' : function(){
		if(Invitations.findOne())
			return Invitations.find({invitator: Meteor.user()._id});
		return null;
	},
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
	'imInvited' : function(){ 
		if(Invitations.findOne())
			return Invitations.findOne({invited:Meteor.user()._id});
		return false;
	}, 
	'rejected' : function(){
		if(Invitations.findOne()){
			return this.state == 'rejected';
		}
		return false;
	},
	'invitation': function(){
		if(Invitations.findOne()){
			return true;
		}
		return false;
	}, 
	'waiting': function(){
		return this.state == "waiting";
	}, 
	'busy':function(){
		return false;
	}, 
	'notFound':function(){
		return false;
	}, 
}); 



Template.quick_game_modal_body.events({
	'click .accept-game-invite' : function(){
		var categoryId = this.categoryId;
		quickGameModalClass = 'modalHidden';
		quickGameModalClassDep.changed();
		quickGameDep.changed();
		Meteor.call('acceptInvitation',this._id,categoryId,function(err,res){
			
		});
	},
	'click .category' : function(evt){
		Session.set("invitedFriend",$('.invite').val());
		choosenCategory =  $(evt.target)[0].text; 
		console.log("choosen");
		console.log(choosenCategory);
		categoryDep.changed();
	},	
	'click #dropdown-button' : function(){
		
	},
	'click .reject-game-invite' : function(){
		Meteor.call('rejectInvitation',Invitations.findOne({})._id,function(err,response){
			if(Invitations.find().fetch().length == 1) {
				quickGameModalClass = 'modalHidden';
				quickGameModalClassDep.changed();	
			}		
		});
	},

});

Template.quick_game.helpers({
	'quickGameModalClass' : function(){
		quickGameModalClassDep.depend();
		return quickGameModalClass;
	}
});