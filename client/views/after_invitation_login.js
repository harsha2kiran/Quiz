var error ;
errorDep = new Deps.Dependency;
validateEmail = function (email){
	var atpos=email.indexOf("@");
	var dotpos=email.lastIndexOf(".");
	if (atpos<1 || dotpos<atpos+2 || dotpos+2>=email.length){
		return false;
	}
  	return true;
}

function submitLoginForm() {
	error = false;
    user={};
    $.each($('#loginForm').serializeArray(), function() {
        user[this.name] = this.value;
    });
    if(user["username"].length < 3){
    	error = "Username must be at least 3 characters long";
    	errorDep.changed();
    	Deps.afterFlush(function(){
    		$("#login-alert-box").removeClass('hidden');
    	});
    }else{
    	 if(!validateEmail(user["email"])){
    	 	error = "Invalid e-mail";
 	    	errorDep.changed();
	    	Deps.afterFlush(function(){
	    		$("#login-alert-box").removeClass('hidden');
	    	});
    	 }else{
    	 	if(user["password"].length < 6){
    	 		error ="Password must be at least 6 characters long";
    	 		errorDep.changed();
		    	Deps.afterFlush(function(){
		    		$("#login-alert-box").removeClass('hidden');
		    	});
    	 	}
    	 }
    }
  	if(!error){
	    if(!Meteor.user()){
	    	Meteor.call('makeUser',user,function(err,res){
	    		console.log("rews");
	    		console.log(res);
	    		switch(res){
	    			case 0:	
		    			var invitator = Router._currentController.path.split("/")[2];
	    				Accounts.createUser({
	    					username:user.username,
	    					email:user.email,
	    					password:user.password
	    				},function(){
			    			if(invitator){
								Meteor.call('makeFriends',Meteor.userId(),invitator);
			    			}
	    				});				
						break;
					case 1: 
						error = "Username already exists";
		    	 		errorDep.changed();
 				    	Deps.afterFlush(function(){
				    		$("#login-alert-box").removeClass('hidden');
				    	});
				    	break;
					case 2: 
						error = "Email already exists";
		    	 		errorDep.changed();
 				    	Deps.afterFlush(function(){
				    		$("#login-alert-box").removeClass('hidden');
				    	});
				    	break;
	    		}
	    	});
	    }
  	}
}
Template.after_invitation_login.helpers({
	error : function(){
		errorDep.depend();
		return error;
	}
});

Template.after_invitation_login.events({
	'click #create-account' : function(){
		console.log("click");
		submitLoginForm();
	},
	'click .button-facebook' : function(){
		var invitator = Router._currentController.path.split("/")[2];
		Meteor.loginWithFacebook({ requestPermissions: ['email']},
		function (error) {
		    if (error) {
		        return console.log("an error"+error+"occured");
		    }else{
				if(invitator){
					Meteor.call('makeFriends',Meteor.userId(),invitator);
				}
		    }
		});		
	},
	'click .button-google' : function(){
		var invitator = Router._currentController.path.split("/")[2];
		Meteor.loginWithGoogle({ requestPermissions: ['email']},
		function (error) {
		    if (error) {
		        return console.log("an error"+error+"occured");
		    }else{
				if(invitator){
					Meteor.call('makeFriends',Meteor.userId(),invitator);
				}
		    }
		});		
	},
	'click .button-twitter' : function(){
		var invitator = Router._currentController.path.split("/")[2];
		Meteor.loginWithTwitter({ requestPermissions: ['email']},
		function (error) {
		    if (error) {
		        return console.log("an error"+error+"occured");
		    }else{
				if(invitator){
					Meteor.call('makeFriends',Meteor.userId(),invitator);
				}
		    }
		});		
	}
});