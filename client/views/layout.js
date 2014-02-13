pathDependency = new Deps.Dependency; 

Template.layout.helpers({
	'displayNavbar': function(){
		pathDependency.depend();
		var path = Router._currentController.path;
		q = (path !="/username");
		console.log(false);
		return q;
	}
});

Template.username.events({
	'click .btn' : function(){
		var newName = $('input[name=name]').val();
		console.log(newName);
		Meteor.call('setUserName',newName, function(err,res){
			console.log("res");
			console.log(res);
			if(res == false){
				pathDependency.changed();
				Router.go("/");
			}else if(res == true){
				$('#username-errors').html("<strong>username already use</strong> <ul>");
			}
		});
	}
});
