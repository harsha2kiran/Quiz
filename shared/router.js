//routing should be define in place whre both user and admin have access
//in case when it is in client directory(as it was before) you cant 
//manage server side routing. 


Router.map(function() {
	if(Meteor.isClient){
	  	this.route('facebook',{
		    path: '/facebook',
		    action: function(req,res){
		      //Meteor.call('getFacebookAccessToken',this.params.code);
		    },
		    after: function(req,res){
		     Meteor.call('getFacebookAccessToken',this.params.code,Meteor.userId(),function(er,res){
		        window.location.href=Meteor.absoluteUrl("user");
		     });; 
		    }
		  });
		this.route('homepage', {
			path: '/',
			waitOn: [categorySub, currentUserSub],
			after: function(){
				if(Meteor.user()){
					if(!Meteor.user().username || !Meteor.user().emails){
						pathDependency.changed();
						console.log("user");
						console.log(Meteor.user());
						console.log(Meteor.user().username);
						Router.go("/missing_data");
					}
				}
			}
		});
		this.route('user', {
			path: '/user',
			after: function(){
				Router.go("/friends");
			}
		});
		this.route('quiz_lobby', {
			path: 'lobby/:_id',
			waitOn: function() {
				var categoryId = this.params._id;
				quickGameDep.depend();
				lobbySub = Meteor.subscribe('lobbyForCategory', categoryId);
				console.log(Lobbys.findOne());
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
			},
			after: function(){
				if(!Meteor.user()){
					Router.go("/");
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

		this.route('question_table', {
			path: '/admin/question',
			waitOn: [categorySub, currentUserSub],
			controller: 'AdminController',			
		});
		this.route('question_table', {
			path: '/user/questions',
			waitOn: [categorySub, currentUserSub],
			controller: 'SimpleController',			
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
		this.route('missing_data',{
			path: '/missing_data',
		});

		this.route('badges', {
			path: '/badges',
			controller: 'SimpleController'
		});
		this.route('hall_of_fame', {
			path: '/hall_of_fame',
			controller: 'SimpleController'
		});
		this.route('friends',{
			path : '/friends',
			controller: 'SimpleController',
		    waitOn: function () {
      			return Meteor.subscribe('friends');
    		}
		});

		this.route('edit_users', {
			path: '/admin/users',
			controller: 'AdminController'
		});
		this.route('after_invitation_login', {
			path : '/invite/:_id',
			after: function(){
				if(Meteor.user()){
					Router.go("/");
				}
			}
		});

		this.route('user_page', {
			path : '/user/:_id',
			waitOn : function() {
				return Meteor.subscribe('hallOfFame');
			},
			data : function(){
				return HallOfFameData.findOne({_id:this.params._id});
			},
		});

		this.route('my_account', {
			path: '/my-account',
			waitOn: [categorySub, currentUserSub],
			controller: 'SimpleController',
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

SimpleController = RouteController.extend({
	after: function(){
		if(!Meteor.user()){
			if(Router._currentController.path != "/"){
				Router.go("/");
			}
		}else if(!Meteor.user().username || !Meteor.user().emails){
			pathDependency.changed();
			console.log("user");
			console.log(Meteor.user());
			console.log(Meteor.user().username);
			Router.go("/missing_data");
		}
	}
});

InvitationController = RouteController.extend({
	action: function(){

	}
})
