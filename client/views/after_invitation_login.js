
Template.after_invitation_login.rendered = function(){
	$('#loginModal').modal('show');
}
function submitLoginForm() {
    user={};
    $.each($('#loginForm').serializeArray(), function() {
        user[this.name] = this.value;
    });
    if(!Meteor.user()){
    	console.log("inside");
		Accounts.createUser(user,function(err){
			if(!err){
				console.log(err);
				$('#loginModal').modal('hide');
				var invitator = Router._currentController.path.split("/")[2];
				Meteor.call('makeFriends',Meteor.user()._id,invitator);
				Router.go("/");
			}
		});
    }else{

    }


}

Template.after_invitation_login.events({
	'click #create-account' : function(){
		console.log("click");
		submitLoginForm();
	}
});