
var userDep = new Deps.Dependency;
Meteor.startup(function(){
	Deps.autorun(function(){
		if(Meteor.user()){
			userDep.changed();
		}
	});
});

var error;
var errorDep = new Deps.Dependency;
function submitDataForm() {
	error = false;
    user={};
    $.each($('#missingDataForm').serializeArray(), function() {
        user[this.name] = this.value;
    });
    if(user["username"].length < 3){
    	error = "Username must be at least 3 characters long";
    	errorDep.changed();
    	Deps.afterFlush(function(){
    		$("#data-alert-box").removeClass('hidden');
    	});
    }else{
    	 if(!validateEmail(user["email"])){
    	 	error = "Invalid e-mail";
 	    	errorDep.changed();
	    	Deps.afterFlush(function(){
	    		$("#data-alert-box").removeClass('hidden');
	    	});
    	}
    }if(!error){
		Meteor.call('setUserMissingData',user.username,user.email,function(err,res){
			console.log("res");
			console.log(res);
			if(res['usernameFound'] == true){
				error = "Username already exists";
	 	    	errorDep.changed();
		    	Deps.afterFlush(function(){
		    		$("#data-alert-box").removeClass('hidden');
		    	});
			}else if(res['emailFound'] == true){
				error = "Email already exists"; 
	 	    	errorDep.changed();
		    	Deps.afterFlush(function(){
		    		$("#data-alert-box").removeClass('hidden');
		    	});			
			}else{
				pathDependency.changed();
				afterEnterDetailDep.changed();
				Router.go("/");
			}
		});
    }
}
Template.missing_data.events({
	'click .btn' : function(){
		submitDataForm();	
	}
});

Template.missing_data.helpers({
	'emailMissing' : function(){
		userDep.depend();
		if(!Meteor.user())
			return;
		return !Meteor.user().hasOwnProperty('emails'); 
	},
	'usernameMissing': function(){
		if(!Meteor.user())
			return;
		return !Meteor.user().hasOwnProperty('username');
	},
	error : function(){
		errorDep.depend();
		return error;
	}
});