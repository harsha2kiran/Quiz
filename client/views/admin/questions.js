Meteor.startup(function(){
    Deps.autorun(function(){
        Meteor.subscribe('questions');
    });
});
console.log("ok");


var tableData = [];
var prepareDataSet = function(){
    tableData = [];
    var counter = 0;
    Questions.find().forEach(function(question){
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

        tableData.push(record);
        counter++;
    });    
}
Template.question_table.rendered = function () {
    $('#edit-question-modal').on('hidden.bs.modal', function() {
        similarQuestions = [];
        questionsDep.changed();
    });  
    var rendered = false;
    try{
        var oTable = $('#question-table').dataTable();
        var rendered = true; 
    }catch(err){
        console.log("err");
    }
    if(!rendered){
        prepareDataSet();
        $('#question-table').remove(); 
        $('#table-container').append('<div><table cellpadding="1" cellspacing="0" border="5" class="display" id="question-table"></table></div>');
        $('#question-table').dataTable( {
            "aaData": tableData,
            "aoColumns": [
                { "sTitle": "status" },
                { "sTitle": "category" },
                { "sTitle": "question" , "sWidth": "30%"},
                {  "sWidth": "10%" ,"bSortable": false, "sTitle": "" },
                {  "sWidth": "10%" ,"bSortable": false, "sTitle": "" },
                {  "sWidth": "10%" ,"bSortable": false, "sTitle": "" }
            ],
            sPaginationType: "full_numbers"
        } ); 
    }
};

Template.question_table.events({

    'click .delete': function(evt){
        var oTable = $('#question-table').dataTable();
        var rowIndex = oTable.fnGetPosition( $(evt.target).closest('tr')[0] );
        oTable.fnDeleteRow(rowIndex);   
        Meteor.call('removeQuestion',evt.target.name);
    },
    'click .change': function(evt){

        var oTable = $('#question-table').dataTable();
        var rowIndex = oTable.fnGetPosition( $(evt.target).closest('tr')[0] ); 
        var value = oTable.fnGetData($(evt.target).closest('tr')[0])[0];  
        var update = (value == "pending") ? "approved" : "pending";
        oTable.fnUpdate( update, rowIndex , 0);  
        Meteor.call('changeQuestionStatus',evt.target.name,update,function(err,res){

        });
    },
    'click .edit': function(evt){
        Session.set("currentStage","editQuestion");
        var oTable = $('#question-table').dataTable();
        var rowIndex = oTable.fnGetPosition( $(evt.target).closest('tr')[0] ); 
        Session.set("selectedRow",rowIndex);
        Session.set("edited",evt.target.name);
        Session.set('editing-question-' + evt.target.name, true);
        $('#edit-question-modal').modal('show');
    }, 
    'click .create-category' : function(){
        Session.set("currentStage","addCategory");
    }, 
    'click .back': function(){
        Session.set("currentStage","editQuestion");
    }, 
    'click .move-question' : function(){
        var selectedCategoryId = $("#move-question-" + this._id).val();
        var oTable = $('#question-table').dataTable();
        var update = Categories.findOne({_id:selectedCategoryId}).name;
        
        oTable.fnUpdate( update, Session.get("selectedRow") , 1);          
    }, 
    'click .update-from-edit': function(){
        var oTable = $('#question-table').dataTable();
        var update = $('.form-control')[0].value;
        update = (update.length >20) ? update.substring(0,20)+"..." : update;
        oTable.fnUpdate( update, Session.get("selectedRow") , 2);   
    },
    'click .add-question': function(){
        Session.set("currentStage","addQuestion");
        $('#edit-question-modal').modal('show');
    },
});

Template.question_table.helpers({
	'categoryName' : function(){
		return Categories.findOne({_id:this.categoryId}).name;
	}, 
	'questions' : function(){
		return Questions.find();
	}, 
	'question' : function(){
		var end = ((this.question.length < 20) ? "" : "...");
		return this.question.substring(0,20) + end;
	}
});

Template.modalbody.helpers({
    'editedQuestion' : function(){
        return Questions.findOne({_id:Session.get("edited")});
    },
    'question' : function(){
        return Session.get("currentStage") == "editQuestion";
    },
    'addQuestion':function(){
 
        return Session.get("currentStage") == "addQuestion";
    }
});

Template.modalfooter.helpers({
    'category' : function(){
        return Session.get("currentStage")=="addCategory";
    }  
});