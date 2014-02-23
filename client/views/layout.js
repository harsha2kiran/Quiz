pathDependency = new Deps.Dependency; 
var userDep = new Deps.Dependency();
Meteor.startup(function(){
	Session.set("emailInfoModalVisibility",false);
});

afterEnterDetailDep = new Deps.Dependency;

Deps.autorun(function(){
	if(Meteor.user()){
		afterEnterDetailDep.depend();
		var result = false; 
		if(Meteor.user().emails){
			result = true;
			_.each(Meteor.user().emails,function(email){
				if(email.verified){
					result = false;
				}
			});
		}
		if(result && !UserSession.get("emailInfoShowed")){
				Meteor.setTimeout(function(){
					Session.set("emailInfoModalVisibility",true);
				},1000);
			UserSession.set("emailInfoShowed",true);
		}	
	};
});

Template.layout.helpers({
	'displayNavbar': function(){
		pathDependency.depend();
		var path = Router._currentController.path;
		return (path !="/missing_data" && path.indexOf('invite') == -1);
	}
});



Template.emailVerificationInfo.events({
	'click #closeEmailVerificationInfo' : function(){
		$('#emailVerification_modal').addClass("modalHidden");
		$('#emailVerification_modal').removeClass("modalActive");	
		Session.set("emailInfoModalVisibility",false);	
	}
});

Template.emailVerificationInfo.helpers({
	'visible' : function(){
		return Session.get("emailInfoModalVisibility") == true;
	}
});

