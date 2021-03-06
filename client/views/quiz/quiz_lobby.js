
var infoDep = new Deps.Dependency;
var info ;
var stop; 
var countdown;
Meteor.startup(function(){
	var handle = Lobbys.find().observe({
		added: function(lobby){
			info = "";
			infoDep.changed();
			if(lobby){

				if(lobby.playerCount == 2){
					var time = 5;
					countdown = Meteor.setInterval(function() {
						info = 'Game Starts in' + time + 'second(s)';
						infoDep.changed();
						time--;
					}, 1000);

					stop = Meteor.setTimeout(function() {
						info = 'Game will start...';
						infoDep.changed();
						Meteor.clearInterval(countdown);
						countdown = 0;
					}, 6000);

				}else if(lobby.playerCount == 1){
					info = "";
					infoDep.changed();
				}
			}else{

			}
		},
		changed : function(newDoc,oldDoc){
			if(newDoc.playerCount == 1 && oldDoc.playerCount == 2){
				Meteor.clearInterval(countdown);
				Meteor.clearTimeout(stop);
				var quiz = Quizzes.findOne();	
				if(countdown!=0){
					console.log("countdown");
					console.log(countdown);
					info = "Your oponent left you will be redirect to lobby";
					Meteor.call('setUserState','online',quiz.players[0].userId);
					Meteor.setTimeout(function(){
					Router.go('/');
						Meteor.setTimeout(function() {
							Router.go('/lobby/' + quiz.categoryId);
						},100);
					},3000);
					infoDep.changed();
				}

			}if(newDoc.playerCount == 2 && oldDoc.playerCount == 1){
				var time = 5;
				countdown = Meteor.setInterval(function() {
					info = 'Game Starts in' + time + 'second(s)';
					infoDep.changed();
					time--;
				}, 1000);

				stop = Meteor.setTimeout(function() {
					info = 'Game will start...';
					infoDep.changed();
					Meteor.clearInterval(countdown);
				}, 6000)
			}
		}

	});
});


Template.quiz_lobby.helpers({

	info : function(){
		infoDep.depend();
		return info;
	},
	noFriendship : function(){
		var quiz = Quizzes.findOne({});
		if (Meteor.user()) {
			var players = quiz.players;

			var currentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});

			var opponentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});
			var result = true;
			_.each(Meteor.user().friends,function(friend){
				if(friend == opponentPlayer.userId){
					result = false;
				}
			});
			return result;
		}
	},
	invitation : function(){
		var quiz = Quizzes.findOne({});
		if (Meteor.user()) {
			var players = quiz.players;

			var currentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});

			var opponentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});
			var result = false;
			_.each(Meteor.user().invitators,function(inv){
				console.log("inv");
				console.log(inv);
				console.log(opponentPlayer);
				if(inv == opponentPlayer.userId){
					result = true;
				}
			});
			_.each(Meteor.user().friends,function(friend){
				if(friend == opponentPlayer.userId){
					result = false;
				}
			});
			console.log("result");
			console.log(result);
			return result;
		}
	},
	invitationSend : function(){
		var quiz = Quizzes.findOne({});
		if (Meteor.user()) {
			var players = quiz.players;

			var currentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});

			var opponentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});
			var result = false;
			_.each(Meteor.user().requested,function(inv){
				if(inv == opponentPlayer.userId){
					result = true;
				}
			});
			return result;
		}		
	},
	prequiz: function()  {
		var quiz = Quizzes.findOne({});
		var lobby = Lobbys.findOne({});
		return (!quiz || quiz.state === 'prequiz' || (countdown != 0 && lobby.playerCount == 1));
	},
	categoryName: function() {
		var category = Categories.findOne( this.categoryId );
		return category.name;
	},
	lobby: function() {
		return Lobbys.findOne({});
	},
	current_question: function() {
		var quiz = Quizzes.findOne({});
		return quiz.userQuestion;
	},

	question_results: function() {
		var quiz = Quizzes.findOne({});
		return (quiz.state === 'questionresults' || quiz.state === 'quizfinished' || quiz.state === 'quizfinishedearly');
	},
	quiz_finished: function() {
		
		var quiz = Quizzes.findOne({});
		return (quiz.state === 'quizfinished');
	},
	quiz_finished_early: function() {

		var quiz = Quizzes.findOne({});
		if(quiz.state === 'quizfinishedearly'){
			Meteor.call('setUserState','online',Meteor.user()._id);
		}
		return (quiz.state === 'quizfinishedearly');
	},
	winner_string: function() {
		var quiz = Quizzes.findOne({});
		if (Meteor.user()) {
			var players = quiz.players;

			var currentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});

			var opponentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});

			if (currentPlayer.score === opponentPlayer.score)
				return "It was a tie! You both scored " + currentPlayer.score + " points.";
			else if (currentPlayer.score > opponentPlayer.score)
				return "Congratulations! You won with " + currentPlayer.score + " points.";
			else 
				return "Unlucky! " + opponentPlayer.username + " won with " + opponentPlayer.score + " points.";
		}
	},
	question_number: function() {
		var quiz = Quizzes.findOne({});
		return quiz.currentQuestion + 1;
	},
	rematch_me: function() {
		var quiz = Quizzes.findOne({});
		if (Meteor.user()) {
			var currentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});

			return currentPlayer.rematch;
		}
	},
	rematch_opponent: function() {
		var quiz = Quizzes.findOne({});
		if (Meteor.user()) {
			var opponentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});

			return opponentPlayer.rematch;
		}
	},
	opponent_name: function() {
		var quiz = Quizzes.findOne({});
		if (Meteor.user()) {
			var opponentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});

			return opponentPlayer.username;
		}
	},
	opponent_in_lobby: function() {
		var lobby = Lobbys.findOne({});
		return (lobby.players.length === 2);
	}
});

Template.answer_option.helpers({
	no_empty : function(){
		return this.option != "";
	},
	disabled: function() {
		var quiz = Quizzes.findOne({});
		if (Meteor.user()) {
			var currentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});

			if (currentPlayer.answered || quiz.state === "questionresults" || quiz.state === "quizfinished" || quiz.state === 'quizfinishedearly')
				return 'disabled="disabled"';
		}
	},
	button_color: function() {
		var quiz = Quizzes.findOne({});
		
		if (quiz.state === "inprogress")
			return "primary";
		else if (quiz.state === "questionresults" || quiz.state === "quizfinished" || quiz.state === 'quizfinishedearly') {
			var optionId = this.id;

			if (optionId === quiz.userQuestion.correctAnswer)
				return "success";
			else
				return "danger";
		}
		
	},
	myChoice: function() {
		var quiz = Quizzes.findOne({});
		if (quiz && Meteor.user()) {
			var currentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});

			var optionId = this.id;
			if (currentPlayer.answerChosen === optionId)
				return true;
		}
	},
	opponentChoice: function() {
		var quiz = Quizzes.findOne({});
		if (quiz && Meteor.user() && quiz.state === "questionresults") {

			var opponentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});
			var optionId = this.id;

			
			if (opponentPlayer.answerChosen === optionId)
				return true;
		}
	}
});

Template.quiz_lobby.events({
	'click .accept-friend' : function(){
		console.log("clicked");
		var quiz = Quizzes.findOne({});
		if (Meteor.user()) {
			var players = quiz.players;

			var currentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});

			var opponentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});
		}		
		
		var sender = currentPlayer.userId;
		var recipient = opponentPlayer.userId;
		var name = currentPlayer.username;
		var message = "user " + name + " accepted your friend request ";
		var title = "friend request accepted";
		console.log("sender");
		console.log(sender);
		console.log("recipient");
		console.log(recipient);
		Meteor.call('sendInternalMessage',sender,recipient,title,message);
		Meteor.call('makeFriends',sender,recipient);

	},
	'click .reject-friend' : function(){

		var quiz = Quizzes.findOne({});
		if (Meteor.user()) {
			var players = quiz.players;

			var currentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});

			var opponentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});
			var result = false;
			_.each(Meteor.user().requested,function(inv){
				if(inv == opponentPlayer.userId){
					result = true;
				}
			});
			return result;
		}		
		var self = this;

		var sender = currentPlayer.userId;
		var recipient = opponentPlayer.userId;
		var name = currentPlayer.username;
		var message = "user " + name + " reject your friend request ";
		var title = "friend request rejected";
		Meteor.call('sendInternalMessage',sender,recipient,title,message);

	},
	'click .question-option': function(evt) {
		var quizId = Quizzes.findOne({})._id;
		Meteor.call('answerQuestion', quizId, this.id, function(err, res) {
			if (err) {
				console.log(err);
			} else {
				$('button.question-option').attr('disabled', 'true')
			}
				
		});	
	},
	'click .quiz-rematch': function(evt) {
		var quiz = Quizzes.findOne({});
		Meteor.call('playerRematch', quiz._id, function(err, res) {
			if (!err) {
				
			}
		});
	},
	'click .new-game': function(evt) {
		var quiz = Quizzes.findOne({});
		Meteor.call('declineRematch', quiz._id, function(err, res) {
			if (!err) {
				Router.go('/');
				Meteor.setTimeout(function() {
					Router.go('/lobby/' + quiz.categoryId);
				},100);
			}
				
		});
	},
	'click .make-friend' : function(){
		var quiz = Quizzes.findOne({});
		if (Meteor.user()) {
			var opponentPlayer = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});
			Meteor.call('sendFriendRequest',Meteor.user()._id,opponentPlayer.userId);
		} 
	}
});



var quizCountdownTimer = function() {
	var time = 5;
	var countdown = Meteor.setInterval(function() {
		$('#quiz-countdown').html('<p>Game Starts in ' + time + ' second(s)</p>');
		time--;
	}, 1000);

	/*Meteor.setTimeout(function() {
		$('#quiz-countdown').html('Game will start...');
		Meteor.clearInterval(countdown);
	}, 6000);
*/
}


Template.currentPlayerStats.helpers({
	playerMe: function() {
		var quiz = Quizzes.findOne();
		if (quiz && Meteor.user()) {
			var player = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});

			return player;
		}
	}
});

Template.opponentPlayerStats.helpers({
	playerOpponent: function() {
		var quiz = Quizzes.findOne();
		if (quiz && Meteor.user()) {
			var player = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});

			return player;
		}
	}
});

Template.question_result.helpers({
	quiz_finished_early: function() {

		var quiz = Quizzes.findOne({});
		if(quiz.state === 'quizfinishedearly'){
			Meteor.call('setUserState','online',Meteor.user()._id);
		}
		return (quiz.state === 'quizfinishedearly');
	},
	explanation: function() {
		var quiz = Quizzes.findOne({});
		if (quiz)
			return quiz.userQuestion.explanation;
	},
	players: function() {
		var quiz = Quizzes.findOne({});
		if (quiz) {
			return quiz.players;
		}
			
	},
	question_number: function() {
		var quiz = Quizzes.findOne({});
		return quiz.currentQuestion + 1;
	},
});

Template.currentPlayerResults.helpers({
	answered: function() {
		var quiz = Quizzes.findOne();
		if (quiz && Meteor.user()) {
			var player = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});
			return player.answered === true;
		}
	},
	correct_string: function() {
		var quiz = Quizzes.findOne();
		if (quiz && Meteor.user()) {
			var player = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});
			if (player.answerChosen === quiz.userQuestion.correctAnswer)
				return "correctly";
			else
				return "incorrectly";
		}
	},
	answer_time: function() {
		var quiz = Quizzes.findOne();
		if (quiz && Meteor.user()) {
			var player = _.find(quiz.players, function(plyr) {
				return plyr.userId === Meteor.user()._id;
			});

			return player.answeredTime;
		}
	}
});


Template.opponentPlayerResults.helpers({
	answered: function() {
		var quiz = Quizzes.findOne();
		if (quiz && Meteor.user()) {
			var player = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});
			return player.answered === true;
		}
	},
	username: function() {
		var quiz = Quizzes.findOne();
		if (quiz && Meteor.user()) {
			var player = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});

			return player.username
		}
	},
	correct_string: function() {
		var quiz = Quizzes.findOne();
		if (quiz && Meteor.user()) {
			var player = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});
			if (player.answerChosen === quiz.userQuestion.correctAnswer)
				return "correctly";
			else
				return "incorrectly";
		}
	},
	answer_time: function() {
		var quiz = Quizzes.findOne();
		if (quiz && Meteor.user()) {
			var player = _.find(quiz.players, function(plyr) {
				return plyr.userId !== Meteor.user()._id;
			});

			return player.answeredTime;
		}
	}
});

Template.questionClock.helpers({
	question_clock: function() {
		var quiz = Quizzes.findOne({});
		return quiz.clock;
	},	
});

