Categories = new Meteor.Collection('categories');
Questions = new Meteor.Collection('questions');
Lobbys = new Meteor.Collection('lobbys');
Quizzes = new Meteor.Collection('quizzes');

categorySub = Meteor.subscribe('allCategories');
currentUserSub = Meteor.subscribe('currentUser');
lobbySub = null;