Template.missing_data.events({
	'click .btn' : function(){
		$('#username-errors').html("");
		$('#email-errors').html("");
		var newName = $('input[name=name]').val();
		var email = $('input[name=email]').val();
		if(email.indexOf("@") == -1){
			$('#email-errors').html("<strong>bad email format</strong> <ul>");
		}else{
			Meteor.call('setUserMissingData',newName,email,function(err,res){
	
				if(res['usernameFound'] == true){
					$('#username-errors').html("<strong>username already use</strong> <ul>");
				}else if(res['emailFound'] == true){
					$('#email-errors').html("<strong>email already use</strong> <ul>");				
				}else{
					pathDependency.changed();
					afterEnterDetailDep.changed();
					Router.go("/");
				}
			});
		}
	}
});

Template.missing_data.helpers({
	'emailMissing' : function(){
		if(!Meteor.user())
			return;
		return !Meteor.user().hasOwnProperty('emails'); 
	},
	'usernameMissing': function(){
		if(!Meteor.user())
			return;
		return !Meteor.user().hasOwnProperty('username');
	}
});