Template.quiz_lobby.helpers({
	prequiz: function()  {
		var quiz = Quizzes.findOne({});
		return (!quiz || quiz.state === 'prequiz');
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
	question_clock: function() {
		var quiz = Quizzes.findOne({});
		return quiz.clock;
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

			Meteor.call('makeFriends',Meteor.user()._id,opponentPlayer.userId,true);
		} 
	}
});

Template.quiz_lobby.created = function() {
	Deps.autorun(function() {
		var lobby = Lobbys.findOne({});
		if (lobby) {
			if (lobby.playerCount === 2) {
				quizCountdownTimer();
			}
		}
	});
}

var quizCountdownTimer = function() {
	var time = 5;
	var countdown = Meteor.setInterval(function() {
		$('#quiz-countdown').html('<p>Game Starts in ' + time + ' second(s)</p>');
		time--;
	}, 1000);

	Meteor.setTimeout(function() {
		$('#quiz-countdown').html('Game will start...');
		Meteor.clearInterval(countdown);
	}, 6000);
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
			
	}
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