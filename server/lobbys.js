/*
	Lobbys: (yes I know I spelt this wrong)

	fields:
		categoryId: category of the questions that will get asked
		players: array of players in the lobby containing their username and Meteor.user()._id
		playerCount: count of the number of players in the lobby. Not essential since we could just do .length on the players array
		playing: boolean, true if the lobby is engaged in a quiz, otherwise false
*/



Meteor.publish('lobbyForCategory', function(categoryId) {
	console.log("inside subscripiton")

	var userId = this.userId;
	//if a non logged in user goes into a lobby we do nothing
	var user = Meteor.users.findOne(userId);
	console.log(user.username);
	if (userId) {
		var lobbyId = addToLobby(userId, categoryId);
	}
	else
		return;

	this.onStop(function() {
		//when the publication for a user stops they get removed from the lobby.
		//this is a much better way of doing it than the common lastSeen timer thing that you see in a bunch of other similar projects
		//such as chat rooms
		if (userId) {
			removeFromLobby(userId, lobbyId);
		}
	});
	return Lobbys.find({_id: lobbyId});
});

//function for managing the lobbies.
var addToLobby = function(userId, categoryId) {
	var user = Meteor.users.findOne(userId);
	var lobbyFromInvitation;

	Lobbys.find().forEach(function(lobby){
		if(lobby.playerCount == -1){
			Lobbys.remove({_id:lobby._id});
		}
		if(lobby.playerCount == 2){
			var player = {
				'username': user.username,
				'userId' : userId
			}
			/*console.log("player found");
			console.log(player);
			console.log(lobby);*/
			_.each(lobby.players,function(pl){
				console.log("player");
				console.log(player);
				console.log("pl");
				console.log(pl);
				if(pl.username == player.username){
					console.log("hit");
					lobbyFromInvitation = lobby._id;
				}
			});
		}
	});
	if(lobbyFromInvitation){
		return lobbyFromInvitation;
	}
	var alreadyInLobby = Lobbys.findOne({ categoryId: categoryId, 'players.userId': userId });


	if (alreadyInLobby)
		return alreadyInLobby._id;
	var currentLobby = Lobbys.findOne({ categoryId: categoryId, playing: false });

	//a non-active lobby does not exist for this category so we create one.

	if (!currentLobby) {
		var newLobby = Lobbys.insert({
			categoryId: categoryId,
			players: [
				{
					username: user.username,
					userId: userId
				}
			],
			playerCount: 1,
			playing: false
		});

		return newLobby;
	}
	//a empty lobby exists so we put this player into it and have them wait for another player.
	if (currentLobby.playerCount === 0) {
		Lobbys.update(currentLobby._id,
		{
			$push: { players: { username: user.username, userId: userId } },
			$inc: { playerCount: 1 }
		});

		return currentLobby._id;
	} else if (currentLobby.playerCount === 1) {
		//A player joins a lobby with 1 other player
		Lobbys.update(currentLobby._id,
		{
			$push: { players: { username: user.username, userId: userId } },
			$inc: { playerCount: 1 },
			$set: { playing: true }
		});
		//if this lobby has not already resulted in a quiz we start one. This should always happen unless a 2nd player joins a lobby,
		//a quiz starts then they leave and join the lobby again.
		if (!Quizzes.findOne({ lobbyId: currentLobby._id })) {
			Quiz.createNewQuiz(categoryId, currentLobby._id);
		}
			
		return currentLobby._id;
	}

}

//removes a player from a lobby when their subscription ends (i.e. they leave the page)
var removeFromLobby = function(userId, lobbyId) {
	var player = Meteor.users.findOne({_id:userId}); 
	if(player.state == "busy"){
		Meteor.call('setUserState','online',userId);
	}
	Lobbys.update(lobbyId, 
	{
		$pull: { players: { userId: userId } },
		$inc: { playerCount: -1 }
	});
}