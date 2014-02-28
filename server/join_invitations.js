Meteor.methods({
	'sendMail' : function(friend){
		var flag = false;
		var userFound;
		Meteor.users.find().forEach(function(user){
			_.each(user.emails,function(email){
				if(email.address == friend){
					flag = true;
					userFound = user;
				}
			});
		});
		if(!flag){
			var invitaionLink = " " + Meteor.absoluteUrl('invite') + "/"+Meteor.user()._id;
			Email.send({
			    from: 'no-reply@quiz.com',
			    to: friend,
			    subject: "join to the quiz",
			    text: "your friend invites you to play please click link below"+ "\n"
			    +invitaionLink
	 	  	});
		}else{
			var res = {
				code : 1,
				user : userFound,
			}
			return res;
		}
	}
});