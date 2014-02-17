//files in dir shared are shared :), both client and server have access
//this is proper place for define Collections. 

Badges = new Meteor.Collection('badges');
Categories = new Meteor.Collection('categories');
Questions = new Meteor.Collection('questions');
Lobbys = new Meteor.Collection('lobbys');
Quizzes = new Meteor.Collection('quizzes');
HallOfFameData = new Meteor.Collection('hallOfFameData');
Invitations = new Meteor.Collection('invitations');
lobbySub = null;
Messages = new Meteor.Collection("messages");