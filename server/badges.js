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
	}

});