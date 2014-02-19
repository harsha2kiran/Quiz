pathDependency = new Deps.Dependency; 
var userDep = new Deps.Dependency();
Meteor.startup(function(){
	Session.set("emailInfoShowed",false);
	console.log(Session.get("emailInfoShowed"));
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
		if(result && !Session.get("emailInfoShowed")){
				Meteor.setTimeout(function(){
					Session.set("emailInfoModalVisibility",true);
				},1000);
			Session.set("emailInfoShowed",true);
		}	
	};
});

Template.layout.helpers({
	'displayNavbar': function(){
		pathDependency.depend();
		var path = Router._currentController.path;
		q = (path !="/missing_data");
		console.log(false);
		return q;
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

