var current = 0;

Meteor.startup(function(){
	Meteor.subscribe('badges');
	Deps.autorun(function(){
	  	if(Meteor.user()){
			Meteor.users.find({_id:Meteor.user()._id},{fields:{'stats.points.all':1}}).observeChanges({
				changed : function(id,doc){
					console.log("changed");
					console.log(id);
					if(id == Meteor.user()._id){
						if((doc.stats.points.all-current) > 0){
							current = doc.stats.points.all;
							var badgesShouldBeGive =[];
							Badges.find().forEach(function(badge){
								var hasUserBadge = false;
								_.each(Meteor.user().badges,function(userBadge){
									if(badge._id == userBadge._id)
										hasUserBadge = true;
								});
								if(!hasUserBadge && !(current<badge.points))
									badgesShouldBeGive.push(badge);
							});
							_.each(badgesShouldBeGive,function(badge){
								Meteor.call('giveBadge',badge);
							});
						}
					}
				}
			});
	  	}
	});
});

Template.badges.badges = function(){
	return Badges.find();
};

Template.badges.haveUserBadge = function(){
	if(!Meteor.user())
		return;
	return !(Meteor.user().stats.points.all < this.points);
}

Template.badges.percentage = function(){
	if(!Meteor.user())
		return;
	return Meteor.user().stats.points.all*100/this.points;
};


