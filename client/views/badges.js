Template.badges.badges = function(){
	return Badges.find();
};

Template.badges.haveUserBadge = function(){
	return !(Meteor.user().stats.points.all < this.points);
}

Template.badges.percentage = function(){
	return Meteor.user().stats.points.all*100/this.points;
};