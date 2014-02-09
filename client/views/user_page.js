

Template.user_page.helpers({
	'wins' : function(){
		return this.stats.wins.all;
	},
	'ties' : function(){
		return this.stats.ties.all;
	},
	'games' : function(){
		return this.stats.wins.all+this.stats.defeats.all+this.stats.ties.all;
	},
	'defeats' : function(){
		return this.stats.defeats.all;
	}
});

Template.user_badges.badges = function(){
	var result = []; 
	var points = this.stats.points.all;
	Badges.find().forEach(function(badge){
		if(badge.points < points){
			result.push(badge); 
		}
	});
	return result;
}