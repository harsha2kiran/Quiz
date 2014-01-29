//routing should be define in place whre both user and admin have access
//in case when it is in client directory(as it was before) you cant 
//manage server side routing. 


Router.map(function() {
	if(Meteor.isClient){
	this.route('homepage', {
		path: '/',
		waitOn: [categorySub, currentUserSub]
	});

	this.route('quiz_lobby', {
		path: 'lobby/:_id',
		waitOn: function() {
			var categoryId = this.params._id;
			lobbySub = Meteor.subscribe('lobbyForCategory', categoryId);
			var lobby = Lobbys.findOne({});
			if (lobby) {
				var quizSub = Meteor.subscribe('currentQuiz', lobby._id);
			}
			return [categorySub, currentUserSub, lobbySub, quizSub];
		},
		data: function() {
			return {
				categoryId: this.params._id
			}
		}
	});

	this.route('admin', {
		path: '/admin',
		waitOn: [categorySub, currentUserSub],
		controller: 'AdminController'
	});

	this.route('edit_categories', {
		path: '/admin/categories',
		waitOn: [categorySub, currentUserSub],
		controller: 'AdminController',
		data: function() { return Categories.find({}); }
	});

	this.route('edit_questions', {
		path: '/admin/questions/:_id',
		waitOn: function() {
			var questionSub = Meteor.subscribe('questionsForCategory', this.params._id);
			return [categorySub, currentUserSub, questionSub];
		},
		controller: 'AdminController',
		data: function() {
			return {
				categoryId: this.params._id
			}
		}
	});
	this.route('edit_badges', {
		path: '/admin/badges',
		controller: 'AdminController',
	});
	this.route('badges', {
		path: '/badges'
	});
	this.route('hall_of_fame', {
		path: '/hall_of_fame'
	});

	this.route('edit_users', {
		path: '/admin/users',
		controller: 'AdminController'
	});

	this.route('my_account', {
		path: '/my-account',
		waitOn: [categorySub, currentUserSub]
	});	
	}

});

Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: '404',
  loadingTemplate: 'loading'
});

AdminController = RouteController.extend({
	action: function() {
		//yeah this check is client side so a malicious user could get access to the page but publications will ensure only admins can see
		//sensitive data and server side methods will ensure only admins can add/edit/delete appropriate stuff
		if (!Meteor.user() || !(Meteor.user().isAdmin || Meteor.user().isModerator)) {
			this.render('access_denied');
		} else {
			this.render();
		}
	}
});
