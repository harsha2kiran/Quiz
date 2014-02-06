/*
	fields:
		categoryId: id of the category the question belongs to,
		question: the question itself
		answer: Object, array of possible answers
		correctAnswer: index of the correct answer to the question
		explanation: String of the explanation to the answer
*/

Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

//publishing all the questions for a given category. intended for the CRUD interface where admins can edit them
Meteor.publish('questionsForCategory', function(categoryId) {
	check(categoryId, String);
	if (!(Users.isAdmin(this.userId) || Users.isModerator(this.userId)))
		return;
	
	return Questions.find({ categoryId: categoryId });
});

Meteor.publish('questions',function(){
	return Questions.find();
});

Meteor.methods({
	addQuestion: function(categoryId, question, answers, correctAnswer, explanation) {
		var status = (Users.isAdmin(this.userId) || Users.isModerator(this.userId)) ? "approved" : "pending";
		check(categoryId, String);
		check(question, String);
		//XX validate answers
		check(correctAnswer, Number);
		check(explanation, String);
		//checking is user initiating this is an admin
		if (!(Users.isAdmin(this.userId) || Users.isModerator(this.userId)))
			throw new Meteor.Error(500, "Only Admins can add questions");

		//checking that the category this question belongs to actually exists
		if (!Categories.findOne(categoryId))
			throw new Meteor.Error(500, "This category does not exist");

		var q = Questions.insert({
			status: status,
			categoryId: categoryId,
			question: question,
			questionWords : question.split(" "),
			answer: answers,
			correctAnswer: correctAnswer,
			explanation: explanation
		});

		//have to update the question count for the category
		Categories.update(categoryId, 
			{ $inc: { questionCount: 1 } } );
		return q;
	},
	removeQuestion: function(questionId) {
		check(questionId, String);

		if (!(Users.isAdmin(this.userId) || Users.isModerator(this.userId)))
			throw new Meteor.Error(500, "Only Admins can add questions");

		var question = Questions.findOne(questionId);

		if (!question)
			throw new Meteor.Error(500, "This question does not exist.");

		Questions.remove(questionId);
		Categories.update(question.categoryId,
			{ $inc: { questionCount: -1 } } );

	},
	changeQuestionStatus: function(id,status){
		if (!(Users.isAdmin(this.userId) || Users.isModerator(this.userId)))
			throw new Meteor.Error(500, "Only Admins can edit questions");

		//checking question exists
		if (!Questions.findOne(id))
			throw new Meteor.Error(500, "This question does not exist");

		//checking is user initiating this is an admin
		if (!(Users.isAdmin(this.userId) || Users.isModerator(this.userId)))
			throw new Meteor.Error(500, "Only Admins can add questions");

		Questions.update({_id:id},{$set:{status: status}});

	},
	updateQuestion: function(questionId, question, answers, correctAnswer, explanation) {
		check(questionId, String);
		check(question, String);
		//XX validate answers
		check(correctAnswer, Number);
		check(explanation, String);

		if (!(Users.isAdmin(this.userId) || Users.isModerator(this.userId)))
			throw new Meteor.Error(500, "Only Admins can edit questions");

		//checking question exists
		if (!Questions.findOne(questionId))
			throw new Meteor.Error(500, "This question does not exist");

		//checking is user initiating this is an admin
		if (!(Users.isAdmin(this.userId) || Users.isModerator(this.userId)))
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

		if (!(Users.isAdmin(this.userId) || Users.isModerator(this.userId)))
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
	}, 
	findSimilarQuestions: function(question){
		var calculateSimilarity = function(first,second){
			var nos = 0;//numer of similar
			_.each(first,function(word){
				_.contains(second,word) ? nos++ : null;
			});
			var percentage = nos/first.length;
			return percentage;
		}
		var result = [{question:"q",percentage:0}];
		var wordsTyped = question.split(" ");
		Questions.find().forEach(function(question){
			var percentage = calculateSimilarity(wordsTyped,question.questionWords); 
			var count = 0;
			_.each(result,function(element){
				if(percentage > element.percentage && count < 5){
					console.log(percentage);
					console.log(count);
					var newItem = {question : question, percentage: percentage}; 
					result.insert(count,newItem);
					console.log(result[0]); 
					count ++; 
				} 
				result = _.first(result,5);
				result = _.filter(result,function(question){
					console.log(question);
					return question.percentage > 0;
				});
			});
		});
		return result;
	}
});