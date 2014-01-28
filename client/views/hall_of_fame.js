
var period = 'year'; 
var stat = 'points';
var statDep = new Deps.Dependency; 
var periodDep = new Deps.Dependency;


Meteor.startup(function(){
	Deps.autorun(function(){
		Meteor.subscribe('hallOfFame');
	});
});

Template.hall_of_fame.users = function(){
	statDep.depend();
	periodDep.depend();
	var sort = {}; 
	var key = 'stats.'+stat+'.'+period; 
	sort[key] = -1;
	return HallOfFameData.find({},{sort:sort});
}
Template.hall_of_fame.helpers({
	'users' : function(){
		statDep.depend();
		periodDep.depend();
		var sort = {}; 
		var key = 'stats.'+stat+'.'+period; 
		sort[key] = -1;
		return HallOfFameData.find({},{sort:sort});	
	}, 
	'stat' : function(){
		statDep.depend(); 
		return stat; 
	},
	'amount' : function(){
		statDep.depend(); 
		periodDep.depend();
		return this.stats[stat][period]; 
	},  
});

Template.hall_of_fame.events({
	'click .stat':function(evt){		
		stat = evt.target.name;
		statDep.changed();
	},
	'click .period':function(evt){
		period = evt.target.name;
		periodDep.changed();
	}
});