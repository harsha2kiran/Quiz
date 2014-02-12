/*
	fields:
		name: String, name that people will see
		parentId: id of the parent category if any. For example 'Football' would have a parentId pointing to Sport.
			Sport would have a parentId of null because it is not a subcategory
		questionCount: int of the number of questions for the category. necessary to check if a category has enough questions
				to initialise a quiz as opposed to sending all the questions to the client
*/


Meteor.publish('allCategories', function() {
	return Categories.find({});
});

Meteor.methods({
	addCategory: function(name, parentId) {
		check(name, String);
		//a parentId doesn't have to be supplied such as in the case of a new top level category, but if one is supplied it must be a string
		check(parentId, String);
	
		//checking is user initiating this is an admin
		if (!(Users.isAdmin(this.userId) || Users.isModerator(this.userId)))
			throw new Meteor.Error(500, "Only Admins can add categories");

		//if a parentId has been supplied make sure there is actually a corresponding category
		if (!Categories.findOne(parentId))
			throw new Meteor.Error(500, "Invalid parent category supplied");

		//if category name is not unique 
		if (Categories.findOne({ name: name }))
			throw new Meteor.Error(500, "There already exists a category with this name");
		
		Categories.insert({
			name: name,
			parentId: parentId,
			questionCount: 0
		});

	},
	removeCategory: function(categoryId, removeQuestions) {
		check(categoryId, String);
		check(removeQuestions, Boolean);

		//XX check not root category
		console.log('yo');
		var thisCategory = Categories.findOne(categoryId);

		if (!thisCategory)
			throw new Meteor.Error(500, "This category does not exist");

		if (thisCategory.name === "Root Category")
			throw new Meteor.Error(500, "You cannot delete the Root Category");

		if (!(Users.isAdmin(this.userId) || Users.isModerator(this.userId)))
			throw new Meteor.Error(500, "You must be an admin to delete categories");

		var parentCategory = Categories.findOne(thisCategory.parentId);
		if (!parentCategory) {
			parentCategory = Categories.findOne({ name: 'Root Category' });
		}

		var childCategories = Categories.find({ parentId: thisCategory._id }).fetch();
		
		_.each(childCategories, function(category) {
			Categories.update(category._id, {$set: { parentId: parentCategory._id } } );
		});

		if (removeQuestions) {
			Questions.remove({ categoryId: categoryId });
		} else {
			var questionMovedCount = Questions.find({ categoryId: categoryId }).count();
			Questions.update({ categoryId: categoryId }, {$set: { categoryId: parentCategory._id } }, { multi: true } );
			Categories.update(parentCategory._id,
				{ $inc: { questionCount: questionMovedCount } } ); 
		}

		Categories.remove(categoryId);

	},
	getQ: function() {
		console.log(Questions.find().fetch());
	},
	'changeCategoryName' : function(id,newName){
		Categories.update({_id:id},{$set:{name:newName}});
	}
})

Meteor.startup(function() {
	//adding some initial categories and questions to save time when I had reset the project all the time
	if (Categories.find().count() === 0) {
		//inserting the root category
		var rootCategory = Categories.insert({ name: 'Root Category', parentId: null, questionCount: 0 });

		var parentId = Categories.insert({ name: 'Maths', parentId: rootCategory, questionCount: 0 });
		//XX should make a method to add questions so I don't have to hard code the questionCount here.
		var childCategory = Categories.insert({ name: 'Maths I', parentId: parentId, questionCount: 5 });
		
		var question = "How many sides does a Decagon have?";
		var questionWords = question.split(" ");
		Questions.insert({
			categoryId: childCategory,
			status: "approved",
			question: question,
			questionWords: questionWords,
			answer: [
				{id: 0, option: '9'},
				{id: 1, option: '10'},
				{id: 2, option: '12'},
				{id: 3, option: '16'},
			],
			correctAnswer: 1,
			explanation: "Think of Dec like Decimal (base 10)."
		});
		var question = "14 x 4 x 0 x 27 = ?";
		var questionWords = question.split(" ");
		Questions.insert({
			categoryId: childCategory,
			status: "approved",
			question: question,
			questionWords: questionWords,
			answer: [
				{id: 0, option: '0'},
				{id: 1, option: '312'},
				{id: 2, option: '4348'},
				{id: 3, option: '10228'},
			],
			correctAnswer: 0,
			explanation: "Anything multiplied by 0 is 0."
		});
		var question = "4x + 7 = 39. What is x?";
		var questionWords = question.split(" ");
		Questions.insert({
			categoryId: childCategory,
			status: "approved",
			question: question,
			questionWords: questionWords,
			answer: [
				{id: 0, option: '6'},
				{id: 1, option: '7'},
				{id: 2, option: '8'},
				{id: 3, option: '9'},
			],
			correctAnswer: 2,
			explanation: "39 - 7 = 32. 32 ÷ 4 = 8."
		});
		var question = "What is Σ10?";
		var questionWords = question.split(" ");
		Questions.insert({
			categoryId: childCategory,
			status: "pending",
			question: question,
			questionWords: questionWords,
			answer: [
				{id: 0, option: 'What the hell does Σ mean?'},
				{id: 1, option: '45'},
				{id: 2, option: '49'},
				{id: 3, option: '55'},
			],
			correctAnswer: 3,
			explanation: "Σ10 is 10 + 9 + 8 ... + 2 + 1. The shortcut for this is N(N+1) / 2."
		});
		var question = "(2+3) x 8 = ?";
		var questionWords = question.split(" ");
		Questions.insert({
			categoryId: childCategory,
			status: "pending",
			question: question,
			questionWords: questionWords,
			answer: [
				{id: 0, option: '13'},
				{id: 1, option: '15'},
				{id: 2, option: '26'},
				{id: 3, option: '40'},
			],
			correctAnswer: 3,
			explanation: "This simplifies as 5 x 8"
		});
	}
});