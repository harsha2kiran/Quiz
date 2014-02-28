

Template.user_page.helpers({
	'inviteBox' : function(){
		if(_.contains(Meteor.user().friends,this._id)){
			return new Handlebars.SafeString('');
		}else if(_.contains(Meteor.user().requested,this._id)){
			return new Handlebars.SafeString('<h4>friend request sent</h4>');
		}
		else if(Meteor.user()._id == this._id){
			return new Handlebars.SafeString('');
		}else{
			return new Handlebars.SafeString('<button class="btn btn-primary invite">send friend request</button>'); 
		}
	},
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
	},
	'points' : function(){
		return this.stats.points.all;
	},
	'avatar' : function(){
		return this.avatar;
	},
	'username' : function(){
		return this.username;
	} 
});

Template.user_badges.badges = function(){
	var result = []; 
	var points = this.stats.points.all;
	Badges.find().forEach(function(badge){
		if(!(badge.points > points)){
			result.push(badge); 
		}
	});
	return result;
}



Template.user_page.events({
	'click .invite' : function(){
		var sender = Meteor.user()._id;
		var recipient = this._id;
		var message = "user " + Meteor.user().username + " send you friend request ";
		var title = "friend request";
		Meteor.call('sendInternalMessage',sender,recipient,title,message);
	}
});