pathDependency = new Deps.Dependency; 
var userDep = new Deps.Dependency();
Meteor.startup(function(){
	UserSession.set("emailInfoShowed",false);
	console.log(Session.get("emailInfoShowed"));
});


Deps.autorun(function(){
	if(Meteor.user()){
		var result = true; 
		if(Meteor.user().emails){
			_.each(Meteor.user().emails,function(email){
				if(email.verified){
					result = false;
				}
			});
		}
		if(result && !UserSession.get("emailInfoShowed")){
			console.log("will be show");
			Deps.afterFlush(function(){
				$('#emailVerification-modal').modal("show");
			});
			UserSession.set("emailInfoShowed",true);
		}	
	};
});

Template.layout.helpers({
	'displayNavbar': function(){
		pathDependency.depend();
		var path = Router._currentController.path;
		q = (path !="/username");
		console.log(false);
		return q;
	}
});

Template.username.events({
	'click .btn' : function(){
		var newName = $('input[name=name]').val();
		var email = $('input[name=email]').val();
		Meteor.call('setUserMissingData',newName,email,function(err,res){
			if(res['usernameFound'] == true){
				$('#username-errors').html("<strong>username already use</strong> <ul>");
			}else if(res['emailFound'] == true){
				$('#email-errors').html("<strong>username already use</strong> <ul>");				
			}else{
				pathDependency.changed();
				Router.go("/");
			}
		});
	}
});

Template.username.helpers({
	'emailMissing' : function(){
		return !Meteor.user().hasOwnProperty('emails'); 
	},
	'usernameMissing': function(){
		return !Meteor.user().hasOwnProperty('username');
	}
});

