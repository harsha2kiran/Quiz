Meteor.publish('badges', function() {
	return Badges.find({});
});

Meteor.methods({
	'createBadge':function(badge){
		Badges.insert(badge);
	}, 
	'removeBadge': function(badge){ 
		Badges.remove(badge);
	},
	'updateBadge': function(id,badge){
		Badges.update({_id:id},{$set : badge});
	}, 
	'giveBadge' : function(badge){
		Meteor.users.update({_id:this.userId},{$push:{badges:badge}});
		var sender = "system"; 
		var recipient = this.userId;
		var title = "new badge";
		var message = " you just recive badge " + badge.name;
		Meteor.call('sendInternalMessage',sender,recipient,title,message);
	}
	/*'giveUserBadge' : function(userId,badge){
		Meteor.users.update({_id:userId},{$push:{badges:badge}});
	},
	'shouldUserHaveBadge' : function(user,badge){
		return (user.points>badge.points && ((user.badges == undefined) ? true : !(badge.name in user.badges)));
	}*/
});


//observe users and add them badges if they reach required points amount
/*Meteor.startup(function(){
	query = Meteor.users.find(); 
	var handle = query.observeChanges({
		changed: function(id, fields){
			var user = Meteor.users.findOne({_id:id});
			if('points' in fields){
				Badges.find().forEach(function(badge){
					console.log('checking for badge'+badge.name)
					Meteor.call('shouldUserHaveBadge',user,badge,function(err,result){
						if(err)
							console.log("an error"+err+"occured");
						if(result == true){
							Meteor.call('giveUserBadge',user._id,{badge.name,badge.icon},function(err,result){
								if(err)
									console.log("an error"+err+occured);
							});
						} 
					});
				});

			}
		}
	});
}); 
*/
