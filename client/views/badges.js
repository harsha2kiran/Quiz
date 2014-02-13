Template.badges.badges = function(){
	return Badges.find();
};

Template.badges.haveUserBadge = function(){
	return !(Meteor.user().stats.points.all < this.points);
}

Template.badges.percentage = function(){
	return Meteor.user().stats.points.all*100/this.points;
};
var current = 0;
Deps.autorun(function(){
  	if(Meteor.user()){
		Meteor.users.find({_id:Meteor.user()._id},{fields:{'stats.points.all':1}}).observeChanges({
			changed : function(id,doc){
				console.log("changed");
				if((doc.stats.points.all-current) > 0){
					current = doc.stats.points.all;
					Badges.find().forEach(function(badge){
						var hasUserBadge = false;
						_.each(Meteor.user().badges,function(userBadge){
							if(badge._id == userBadge._id)
								hasUserBadge = true;
						});
						if(!hasUserBadge && current>badge.points)
							Meteor.call('giveBadge',badge);
					});
				}
			}
		});
  	}
});

