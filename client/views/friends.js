Template.friends.events({
	'click .invite' : function(evt){
		console.log(evt.target);
		if(evt.target.name == "email"){
			console.log("ok");
			$('#invite_email_modal').modal('show');
		}
	}, 
	'click #send-invitation': function(){
		var friend = $('#email-input').val();
		Meteor.call('sendMail',friend); 
	}
});