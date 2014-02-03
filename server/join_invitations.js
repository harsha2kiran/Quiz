Meteor.methods({
	'sendMail' : function(friend){
		var invitaionLink = " " + Meteor.absoluteUrl('invite') + "/"+Meteor.user()._id;
		Email.send({
		    from: 'no-reply@quiz.com',
		    to: friend,
		    subject: "join to the quiz",
		    text: "your friend invites you to play please click link below"+ "\n"
		    +invitaionLink
 	  	});
	}
});