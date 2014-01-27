/*
	fields:
		categoryId: id of the category the question belongs to,
		question: the question itself
		answer: Object, array of possible answers
		correctAnswer: index of the correct answer to the question
		explanation: String of the explanation to the answer
*/



//publishing all the questions for a given category. intended for the CRUD interface where admins can edit them
Meteor.publish('questionsForCategory', function(categoryId) {
	check(categoryId, String);
	if (!Users.isAdmin(this.userId))
		return;
	
	return Questions.find({ categoryId: categoryId });
});

Meteor.methods({
	addQuestion: function(categoryId, question, answers, correctAnswer, explanation) {
		check(categoryId, String);
		check(question, String);
		//XX validate answers
		check(correctAnswer, Number);
		check(explanation, String);
		//checking is user initiating this is an admin
		if (!Users.isAdmin(this.userId))
			throw new Meteor.Error(500, "Only Admins can add questions");

		//checking that the category this question belongs to actually exists
		if (!Categories.findOne(categoryId))
			throw new Meteor.Error(500, "This category does not exist");

		Questions.insert({
			categoryId: categoryId,
			question: question,
			answer: answers,
			correctAnswer: correctAnswer,
			explanation: explanation
		});

		//have to update the question count for the category
		Categories.update(categoryId, 
			{ $inc: { questionCount: 1 } } );

	},
	removeQuestion: function(questionId) {
		check(questionId, String);

		if (!Users.isAdmin(this.userId))
			throw new Meteor.Error(500, "Only Admins can add questions");

		var question = Questions.findOne(questionId);

		if (!question)
			throw new Meteor.Error(500, "This question does not exist.");

		Questions.remove(questionId);
		Categories.update(question.categoryId,
			{ $inc: { questionCount: -1 } } );

	},
	updateQuestion: function(questionId, question, answers, correctAnswer, explanation) {
		check(questionId, String);
		check(question, String);
		//XX validate answers
		check(correctAnswer, Number);
		check(explanation, String);

		if (!Users.isAdmin(this.userId))
			throw new Meteor.Error(500, "Only Admins can edit questions");

		//checking question exists
		if (!Questions.findOne(questionId))
			throw new Meteor.Error(500, "This question does not exist");

		//checking is user initiating this is an admin
		if (!Users.isAdmin(this.userId))
			throw new Meteor.Error(500, "Only Admins can add questions");

		Questions.update(questionId, 
			{$set: {
				question: question,
				answer: answers,
				correctAnswer: correctAnswer,
				explanation: explanation	
			}});

	},
	moveQuestion: function(questionId, toCategoryId) {
		check(questionId, String);
		check(toCategoryId, String);

		if (!Users.isAdmin(this.userId))
			throw new Meteor.Error(500, "Only Admins can move questions");

		var question = Questions.findOne(questionId);
		if (!question)
			throw new Meteor.Error(500, "This question does not exist");

		if (!Categories.findOne(toCategoryId))
			throw new Meteor.Error(500, "Category to move to does not exist");

		Questions.update(questionId, {$set: { categoryId: toCategoryId } } );

		//since questions are getting moved around I have to update the question counts
		Categories.update(toCategoryId, {$inc: { questionCount: 1 } } );
		Categories.update(question.categoryId, {$inc: { questionCount: -1 } } ); 
	}
});