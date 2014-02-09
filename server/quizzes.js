/*
	fields:
		players: array of player_ids and names and their points
		state: one of 'prequiz', 'inprogress', 'questionresults', 'quizfinished'
			prequiz: the state before the quiz has started with the 5 second countdown in the lobby
			inprogress: the state where a question has been asked and is still in progress (timer still going down and both haven't answered)
			questionresults: state where what both player's have answered is shown to both players as well as the correct answer
			quizfinished: all questions have been asked
			quizfinishedearly: a player left so the quiz finished early and the remaining player has won
		currentQuestion: id of question,
		questions: array of questionIds,
		categoryId: category id of the questions

*/



Meteor.publish('currentQuiz', function(lobbyId) {
	//will only return something if the user is actually in the quiz
	if (!this.userId)
		return;

	var self = this;
	var quiz = Quizzes.find({ lobbyId: lobbyId, 'players.userId': self.userId });

	var players,
			userQuestion,
			state

	var handle = quiz.observeChanges({
		added: function(id, fields) {
			if (fields.players) {
				players = fields.players;
			}

			if (fields.userQuestion) {
				userQuestion = fields.userQuestion;
			}

			if (fields.state !== 'questionresults') {
				fields.players = _.map(fields.players, function(player) {
					return _.omit(player, 'answerChosen');
				});

				fields.userQuestion = _.omit(fields.userQuestion, ['correctAnswer', 'explanation']);
			}
			//XX maybe allow this at the end
			fields = _.omit(fields, ['questions']);
			self.added('quizzes', id, fields);
		},
		changed: function(id, fields) {
			if (fields.state) {
				state = fields.state;
			}
				

			if (fields.players) {
				players = fields.players;
				fields.players = _.map(fields.players, function(player) {
					if (state === 'inprogress') {
						if (player.userId === self.userId)
							return player;
						else
							return _.omit(player, 'answerChosen');
					} else {
						return player;
					}
				});
			}
			
			if (fields.userQuestion) {
				userQuestion = fields.userQuestion;
			}
				
			if (fields.state) {
				if (state === 'questionresults') {
					self.changed('quizzes', id, { players: players });
					self.changed('quizzes', id, { userQuestion: userQuestion });
				}
			}
			self.changed('quizzes', id, fields);
		},
		removed: function(id) {
			self.removed('quizzes', id);

		}
	});

	self.ready();
	self.onStop(function() {
		handle.stop();
	});
});

Meteor.methods({
	quickGame: function(categoryId,player_1_id,player_2_id){
		var players =  [
				{
					username: Meteor.users.findOne({_id:player_1_id}).username,
					userId: player_1_id
				}, 
				{
					username: Meteor.users.findOne({_id:player_2_id}).username,
					userId: player_2_id
				}
			];		

		var newLobby = Lobbys.insert({
			categoryId: categoryId,
			players : players,
			playerCount: 2,
			playing: true
		});
		console.log(Quiz);
		Quiz.createNewQuiz(categoryId, newLobby);
		return newLobby;
	},
	answerQuestion: function(quizId, answerIdx) {
		check(quizId, String);
		check(answerIdx, Number);

		var userId = this.userId;
		var quiz = Quizzes.findOne({ _id: quizId, 'players.userId': this.userId });
		//checking that a valid quizId has been supplied and that this user is playing in it
		if (!quiz)
			throw new Meteor.Error("You must be taking part in this quiz to answer a question");
		//getting this user from the players array
		var player = _.find(quiz.players, function(plyr) {
			return plyr.userId === userId;
		});
		//checking if they have already answered
		if (player.answered)
			throw new Meteor.Error("You have already gave an answer to this question");
		//checking that there is still time to answer
		if (!quiz.clock || quiz.clock === 0)
			throw new Meteor.Error("Time has ran out to answer this question");

		var options = quiz.questions[quiz.currentQuestion];
		//checking that the answerIdx is valid
		if (answerIdx < 0 || answerIdx >= options.length)
			Meteor.Error("Not a valid choice for this question");

		Quizzes.update({_id: quizId, 'players.userId': this.userId }, {
			$set: { 
				'players.$.answered': true,
				'players.$.answerChosen': answerIdx,
				'players.$.answeredTime': 10 - quiz.clock
			}
		});

	},
	playerRematch: function(quizId) {
		check(quizId, String);

		var userId = this.userId;
		var quiz = Quizzes.findOne({ _id: quizId, 'players.userId': this.userId });

		if (!quiz)
			throw new Meteor.Error("You must be taking part in this quiz to rematch");

		if (quiz.state !== 'quizfinished')
			throw new Meteor.Error("A quiz must be finished to start a rematch");

		Quizzes.update({ _id: quizId, 'players.userId': userId }, {
			$set: {
				'players.$.rematch': true
			}
		});

		var otherPlayer = _.find(quiz.players, function(plyr) {
			return plyr.userId !== userId;
		});

		if (otherPlayer.rematch === true) {
			Quizzes.remove(quizId);
			Quiz.createNewQuiz(quiz.categoryId, quiz.lobbyId);
		}

	},
	declineRematch: function(quizId) {
		var userId = this.userId;
		var quiz = Quizzes.findOne({ _id: quizId, 'players.userId': this.userId });

		Lobbys.update(quiz.lobbyId, 
		{
			$pull: { players: { userId: userId } },
			$inc: { playerCount: -1 }
		});
	}
});

Quiz = {};

Quiz.createNewQuiz = function(categoryId, lobbyId) {
	var lobby = Lobbys.findOne(lobbyId);

	var numberOfQuestions = 5;

	var players = lobby.players;
	_.each(players,function(player){
		console.log("quizstarted");
		console.log(player);
		Meteor.call('setUserState','busy',player.userId);
	});
	//we already have the players name and id, now adding a score element and answered elements to it
	_.each(players, function(player) {
		player.score = 0;
		player.answered = false;
		player.answerChosen = null;
		player.answeredTime = null;
		player.rematch = null;
	});

	//getting a random N (N being 5 in this case) sample of questions from all the questions in the given category
	//XX this can be improved. It's pretty inefficient in cases where we have way more questions than is required
	var allQuestions = Questions.find({ categoryId: categoryId }).fetch();
	for (var i = allQuestions.length -1; i > 1; i--) {
		var r = Math.floor(Math.random() * i);
		var t = allQuestions[i];
		allQuestions[i] = allQuestions[r];
		allQuestions[r] = t;
	}

	var randomQuestions = allQuestions.slice(0, numberOfQuestions);
	//XX probably want to include the number of questions variable.
	var newQuiz = Quizzes.insert({
		lobbyId: lobbyId,
		categoryId: categoryId,
		players: players,
		state: 'prequiz',
		questions: randomQuestions,
		currentQuestion: 0,
		userQuestion: null,
		clock: 10
	});

	Meteor.setTimeout(function() {
		//after 6 seconds initialise the quiz with the first question
		Quiz.doQuestion(newQuiz, 0);
	}, 6000);
}


Quiz.doQuestion = function(quizId) {
	var quiz = Quizzes.findOne(quizId);
	var currentQuestionIdx = quiz.currentQuestion;
	var question = quiz.questions[currentQuestionIdx];

	Quizzes.update(quizId, {$set: {
		state: 'inprogress',
		userQuestion: question
	}});

	var clock = quiz.clock;

	//this is the countdown logic
	var interval = Meteor.setInterval(function() {
		//counting down each second and sending the time to the client
		clock -= 1;
		Quizzes.update(quizId, {$set: { clock: clock } } );

		//checking if a player has left
		var lobby = Lobbys.findOne(quiz.lobbyId);
		if (lobby.players.length === 1) {
			Quizzes.update(quizId, {$set: { state: 'quizfinishedearly' } } );
			var playerLeft = true;
		}
		
		var bothPlayersAnswered = Quiz.checkBothAnswered(quizId);
		//if time has ran our or both players have answered...
		if (clock === 0 || bothPlayersAnswered || playerLeft) {
			//we stop the countdown, do the results and then after 3 seconds move onto the next question
			Meteor.clearInterval(interval);
			Quiz.doQuestionResults(quizId, currentQuestionIdx, playerLeft);
			if (!playerLeft) {
				Meteor.setTimeout(function() {
					//checking if there are more questions to do in the quiz
					if (currentQuestionIdx < 4) {
						//if there are we increment the question index and reset the timer
						Quizzes.update(quizId,
						{ 
							$inc: { currentQuestion: 1 },
							$set: { clock: 10 } 
						});
						//and reset each player's answer status
						_.each(quiz.players, function(player) {
							Quizzes.update({ _id: quizId, 'players.userId': player.userId },
								{$set: { 
									'players.$.answered': false,
									'players.$.answerChosen': null,
									'players.$.answeredTime': null
								} } );
						});
						//recursively call this function to do the next question
						Quiz.doQuestion(quizId);

					} else {
						//if we're done we change the status which client side will display the winner and so on
						Quizzes.update(quizId, {$set: { state: 'quizfinished' } } );
						_.each(quiz.players,function(player){
							Meteor.call('setUserState','online',player.userId);
						});

						var winner = (quiz.players[0].score>quiz.players[1].score) ? quiz.players[0] :
									((quiz.players[1].score>quiz.players[0].score) ? quiz.players[1] : null);
						if(winner){
							var looser = _.find(quiz.players,function(player){
								return player.userId !== winner.userId;
							});
						}

						if(winner){
							Meteor.call('updateStats',winner.userId,'wins',1);
							Meteor.call('updateStats',looser.userId,'defeats',1);
						}else{
							_.each(quiz.players,function(player){
								Meteor.call('updateStats',player.userId,'ties',1);
							});
						}

					}
				}, 3000);
			}
			
		}
	}, 1000);
}

Quiz.checkBothAnswered = function(quizId) {
	var quiz = Quizzes.findOne(quizId);
	return quiz.players[0].answered && quiz.players[1].answered;
}

Quiz.doQuestionResults = function(quizId, questionIdx, playerLeft) {
	var quiz = Quizzes.findOne(quizId);
	if (!playerLeft)
		Quizzes.update(quizId, {$set: { state: 'questionresults' } } );

	var correctAnswerIdx = quiz.userQuestion.correctAnswer;
	_.each(quiz.players, function(player) {
		if (player.answered) {
			if (player.answerChosen === correctAnswerIdx) {
				//correct answer
				var points = (10 - player.answeredTime);
				Quizzes.update({ _id: quizId, 'players.userId': player.userId },
					{$inc: { 'players.$.score': points } } );

				//update user stats

				Meteor.call('updateStats',player.userId,'points',points);
				if(points > 0){
					Meteor.call('updateStats',player.userId,'answers',1);	
				}

			}
		}
	});
}

Quiz.checkPlayerLeft = function(quizId) {
	var quiz = Quizzes.findOne(quizId);
	var lobby = Lobbys.findOne(lobbyId);

	if (lobby.players.length === 1) {
		var winner = lobby.players[0];
	}
}