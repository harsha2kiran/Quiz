var currentlyEditedBadge = null;

var badgeDep = new Deps.Dependency;

Meteor.startup(function(){
	Deps.autorun(function(){
		Meteor.subscribe('badges');		
	});
});

Template.badges.badges = function(){
	badgeDep.depend();
	return Badges.find();
};

Template.badges.currentlyEditedBadge = function(){
	return currentlyEditedBadge;
};

Template.badges.events({
	'click .add': function(){
		$('#add-badge-modal').modal('show');
	}, 
	'click .delete-badge' : function(){
		Meteor.call('removeBadge',this._id);
	}, 
	'click .edit-badge' : function(){
		currentlyEditedBadge = this; 
		badgeDep.changed();
		$('#edit-badge-modal').modal('show');
	}
}); 

Template.addBadgeModal.events({
	'click #create-badge' : function(){
		var badge = {}; 
		$('.add-badge-modal-input').each(function() {
    		var current = $(this); 
    		badge[current[0].name] = current.val();
		});
		Meteor.call('createBadge',badge,function(err,response){
			if(err)
				console.log("an error"+err+"occured"); 
			$('#add-badge-modal').modal('hide');
		});
	} 
});

Template.editBadgeModal.events({
	'click #edit-badge' : function(){
		var badge = {}; 
		$('.edit-badge-modal-input').each(function() {
    		var current = $(this); 
    		badge[current[0].name] = current.val();
		});
		Meteor.call('updateBadge',this._id,badge,function(err,response){
			if(err)
				console.log("an error"+err+"occured"); 
			$('#edit-badge-modal').modal('hide');
		});

	} 
});