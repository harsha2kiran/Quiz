Template.homepage.helpers({
	categories_that_can_be_quizzed: function() {
		//a category must have at least 5 questions associated with it before someone can take a quiz in it
		return Categories.find({ questionCount: {$gte: 5 }});
	}
});