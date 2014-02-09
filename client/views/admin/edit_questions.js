similarQuestions = []; 
questionsDep = new Deps.Dependency();


Template.edit_questions.helpers({
	categoryName: function() {
		//the 'this' data context comes from the router
		var category = Categories.findOne( this.categoryId );
		return category.name;
	},
	questions: function() {
		return Questions.find({ categoryId: this.categoryId });
	},
});

Template.add_new_question.events({
	'keydown .question-contents' : function(evt){
		if(evt.keyCode == 32 && evt.target.value.length>10){
			Meteor.call('findSimilarQuestions',evt.target.value,function(err,res){
				similarQuestions = res;
				console.log(similarQuestions);
				questionsDep.changed();
			});
		}
	},
	'click #add-question-button': function(evt) {
		//this is to stop the form submitting. I don't actually want a form but it makes bootstrap look good
		evt.preventDefault();
		//array to store all the errors
		var errors = [];
		//resetting all the stuff if this has been submitted with errors before
		$("#add-question-errors").html("");
		$("div").removeClass("has-error");

		var categoryId = this.categoryId;
		if(!categoryId){
			categoryId = $("#choose-category")[0].value;

		}
		var question = $('#new-question-title');
		if (!question.val()) {
			errors.push("Question Title is required");
			question.parent(".form-group").addClass("has-error");
		}
			
		var answers = [];
		$('input.question-answer').each(function(i, element) {
			//each answer will be submitted in the form {id: 0, option: "What the user sees as an option"}
			var answer = {};
			answer.id = i;
			var option = $(this).val();
			if (!option) {
				errors.push("You must provide an Answer for Answer " + (i + 1));
				$(this).parent().parent(".form-group").addClass("has-error");
			}
			answer.option = option;
			answers.push(answer);
		});

		var explanation = $("#question-explanation");
		if (!explanation.val()) {
			errors.push("Answer Explanation is required");
			explanation.parent(".form-group").addClass("has-error");
		}

		var correctAnswerId = $('input[name=answer-options]:checked').index('input[name=answer-options]');
		//will be -1 if none are selected
		if (correctAnswerId === -1) {
			errors.push("You have not specified a correct answer");
		}

		//if there are any errors...
		if (errors.length) {
			//appending them all into a error div
			$("#add-question-errors").html("<strong>You have the following error(s)</strong> <ul>");
			_.each(errors, function(error) {
				$("#add-question-errors").append("<li>" + error  + "</li>");
			});
			$("#add-question-errors").append("</ul>");

		} else {
			//do the server side addQuestion call
			Meteor.call('addQuestion', categoryId, question.val(), answers, correctAnswerId, explanation.val(), function(err, res) {
				if (err) {
					//if a server side error (shouldn't happen because of all the validate client side) then append that to the error div
					$("#add-question-errors").html("<strong>Error: </strong>" + err.reason);
				}else{
					if($('#question-table').dataTable()){
						var question = Questions.findOne({_id:res});
				        var record = []; 
				        record.push(question.status); 
				        var categoryName = Categories.findOne({_id:question.categoryId}).name;
				        record.push(categoryName); 
				        var begin = question.question.substring(0,20); 
				        if(question.question.length > 20)
				            begin += "...";
				        record.push(begin);
				        record.push('<button name="'+question._id+'"class="delete btn btn-danger" >delete</button>');
				        record.push('<button name="'+question._id+'"class="edit btn btn-primary" >edit</button>');
				        record.push('<button name="'+question._id+'"class="change btn btn-warning">change state</button>');
						$('#question-table').dataTable().fnAddData(record);
						$('#edit-question-modal').modal('hide');
					}
				}
			});
			//if no errors, reset the fields
			$('#new-question-title').val('');
			$("#question-explanation").val('');
		}
		
	}
});

Template.question_edit.helpers({
	is_correct: function(answerId, correctAnswerId) {
		return answerId === correctAnswerId;
	},
	editing: function() {
		return Session.get('editing-question-' + this._id);
	}
});

Template.question_edit.events({
	'click .delete-question': function() {
		Meteor.call('removeQuestion', this._id);
	},
	'click .edit-question': function() {
		Session.set('editing-question-' + this._id, true);
	}
});

Template.question_edit_fields.helpers({
	checked: function(correctAnswer) {
		if (this.id === correctAnswer)
			return "checked";
	},
	answer_number: function() {
		return (this.id + 1);
	}
});

Template.question_edit_fields.events({
	'click .update-from-edit': function(evt) {
		//XX yeah it's really bad to be copy and pasting this from the above funciton, in retrospect they should have been the same,
		//but implementing it this way is faster
		//this is to stop the form submitting. I don't actually want a form but it makes bootstrap look good
		evt.preventDefault();
		//array to store all the errors
		var questionId = this._id;
		var errors = [];
		//resetting all the stuff if this has been submitted with errors before
		$("#update-question-errors-" + questionId).html("");
		$("div").removeClass("has-error");

		var question = $('#new-question-title-' + questionId);
		if (!question.val()) {
			errors.push("Question Title is required");
			question.parent(".form-group").addClass("has-error");
		}
			
		var answers = [];
		$('input.question-answer-' + questionId).each(function(i, element) {
			//each answer will be submitted in the form {id: 0, option: "What the user sees as an option"}
			var answer = {};
			answer.id = i;
			var option = $(this).val();
			if (!option) {
				errors.push("You must provide an Answer for Answer " + (i + 1));
				$(this).parent().parent(".form-group").addClass("has-error");
			}
			answer.option = option;
			answers.push(answer);
		});

		var explanation = $("#question-explanation-" + questionId);
		if (!explanation.val()) {
			errors.push("Answer Explanation is required");
			explanation.parent(".form-group").addClass("has-error");
		}

		var correctAnswerId = $('input[name=answer-options-' + questionId + ']:checked').index('input[name=answer-options-' + questionId + ']');
		//will be -1 if none are selected
		if (correctAnswerId === -1) {
			errors.push("You have not specified a correct answer");
		}

		//if there are any errors...
		if (errors.length) {
			//appending them all into a error div
			$("#update-question-errors-" + questionId).html("<strong>You have the following error(s)</strong> <ul>");
			_.each(errors, function(error) {
				$("#update-question-errors-" + questionId).append("<li>" + error  + "</li>");
			});
			$("#update-question-errors-" + questionId).append("</ul>");

		} else {
			//do the server side addQuestion call
			Meteor.call('updateQuestion', questionId, question.val(), answers, correctAnswerId, explanation.val(), function(err, res) {
				if (err) {
					//if a server side error (shouldn't happen because of all the validate client side) then append that to the error div
					$("#update-question-errors-" + questionId).html("<strong>Error: </strong>" + err.reason);
				} else {
					Session.set('editing-question-' + questionId, false);
				}
			});
			//if no errors, reset the fields
		}
	},
	'click .cancel-editing': function() {
		if($('#edit-question-modal'))
			$('#edit-question-modal').modal('hide');
		Session.set('editing-question-' + this._id, false);
	}
});

Template.move_question_dropdown.helpers({
	categories: function() {
		return Categories.find({ _id : { $ne: this.categoryId } }, { sort: { name: 1 } } );
	}
});

Template.move_question_dropdown.events({
	'click .move-question': function(evt) {
		var selectedCategoryId = $("#move-question-" + this._id).val();
		if (selectedCategoryId !== "Select One...") {
			Meteor.call('moveQuestion', this._id, selectedCategoryId);
		}
	}
});

Template.add_new_question.helpers({
	'categoryChoosen': function(){
		return this.categoryId;
	},
	'categories': function(){
		return Categories.find();
	},
});

Template.similarQuestions.helpers({
	'similarQuestions' : function(){
		questionsDep.depend(); 
		var result = [];
		_.each(similarQuestions,function(question){
			result.push(question.question);
		});
		return result;
	}
});
