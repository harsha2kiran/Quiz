var periods = ['year','month','week','day'];
var stats = ['points','wins','answers'];

function resetUsersStats(period){
	var date = new Date().getDate();
	var delay = moment().endOf('period').format("X")-date;
	Meteor.setTimeout(function(){
		for(var count in stats){
			Meteor.users.find().forEach(function(user){
				var update = {};
				var key = 'stats.'+stats[count]+'.'+period; 
				update[key] = 0; 
				Meteor.users.update({_id:user._id},{$set: update});
			});			
		}
		console.log("users stats reset at the and of" + period);
		resetUsersStats(period);
	},delay); 
}

Meteor.startup(function(){
	/*Meteor.users.find().forEach(function(user){
		Meteor.users.remove({_id:user._id});
	});*/
	var periods = ['year','month','week','day'];
	for(var count in periods){
		resetUsersStats(periods[count]);
	}
});

