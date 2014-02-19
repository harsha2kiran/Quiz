Meteor.startup(function(){
    Deps.autorun(function(){
        Meteor.subscribe('questions');
    });
});

var previousValues = [];
var previousRadioValues =[];
var deleteButton = function(id){
    return '<button name="'+id+'"class="delete btn btn-danger" >'+
    '<span  class="glyphicon glyphicon-remove-circle"></button>';
}

var editButton = function(id){
    return '<button name="'+id+'"class="edit btn btn-primary" >'+
    '<span class="glyphicon glyphicon-edit"></button>';
}

var statusChangeButton = function(id,status){
    if(status == "approved"){
        return '<button name="'+id+'"class="change btn btn-success" >'+
        '<span class="glyphicon glyphicon-ok-circle"></button>';
    }else{
        return '<button name="'+id+'"class="change btn btn-warning" >'+
        '<span class="glyphicon glyphicon-ban-circle"></button>';
    }
}

var buttons = function(id,status){
    if(Meteor.user().isAdmin || Meteor.user().isModerator){
        return deleteButton(id)+editButton(id)+statusChangeButton(id,status);
    }else{
        if(status == "pending"){
            return (deleteButton(id)+editButton(id));
        }else{
            return '<button style="display : none" name="'+id+'"></button>';
        }
    }
    
}
var rendered = false;



var tableData = [];
var prepareDataSet = function(){
    tableData = [];
    var counter = 0;
    var query = Questions.find();
    var handle = query.observeChanges({
        added: function(id,question){
            console.log("added");
            console.log(id);
            console.log(rendered);
            if(Meteor.user().isAdmin || Meteor.user().isModerator){
                var record = []; 
                record.push(question.status); 
                var categoryName = Categories.findOne({_id:question.categoryId}).name;
                record.push(categoryName); 
                var begin = question.question.substring(0,20); 
                if(question.question.length > 20)
                    begin += "...";
                record.push(begin);

                _.each(question.answer,function(answer){
                    if(question.correctAnswer == answer.id){
                        record.push('<FONT COLOR="green">'+answer.option+'</FONT>');
                    }else{
                        record.push(answer.option);
                    }
                });
                record.push(deleteButton(id)+editButton(id)+statusChangeButton(id,question.status));
                record.push('<input name="'+id+'"type="checkbox">');
                tableData.push(record);
                counter++;
   
            }else{
                if(question.author == Meteor.user()._id){
                    var record = []; 
                    record.push(question.status); 
                    var categoryName = Categories.findOne({_id:question.categoryId}).name;
                    record.push(categoryName); 
                    var begin = question.question.substring(0,20); 
                    if(question.question.length > 20)
                        begin += "...";
                    record.push(begin);
                    _.each(question.answer,function(answer){
                        if(question.correctAnswer == answer.id){
                            record.push('<FONT COLOR="green">'+answer.option+'</FONT>');
                        }else{
                            record.push(answer.option);
                        }
                    });
                    if(question.answer.length <4){
                        for(var i=0;i<4-question.answer;i++){
                            record.push('');
                        }
                    }                    
                    if(question.status == "pending"){
                        record.push(deleteButton(id)+editButton(id));   
                    }else{
                        record.push('<button style="display : none" name="'+id+'"></button>');
                    }
                    tableData.push(record);                   
                    counter++;
                }     
            }
            if(rendered && question.author != Meteor.user()._id && (Meteor.user().isAdmin || Meteor.user().isModerator)){
                console.log("test0");
                var record = []; 
                record.push(question.status); 
                var categoryName = Categories.findOne({_id:question.categoryId}).name;
                record.push(categoryName); 
                var begin = question.question.substring(0,20); 
                if(question.question.length > 20)
                    begin += "...";
                record.push(begin);
                _.each(question.answer,function(answer){
                    if(question.correctAnswer == answer.id){
                        record.push('<FONT COLOR="green">'+answer.option+'</FONT>');
                    }else{
                        record.push(answer.option);
                    }
                });
                var editPanel = deleteButton(id)+editButton(id);
                if(Meteor.user().isAdmin || Meteor.user().isModerator)
                    editPanel = editPanel +statusChangeButton(id,question.status);
                console.log(editPanel);
                record.push(editPanel);
                record.push('<input name="'+id+'"type="checkbox">');
                $('#question-table').dataTable().fnAddData(record);
            }
        },
        changed: function(id,field){
            Deps.afterFlush(function(){
                var question = Questions.findOne({_id:id});
                var oTable = $('#question-table').dataTable(); 
                console.log("changed"+field.status);
                console.log($('button[name='+id+']').closest('tr')[0]);
                if($('button[name='+id+']').closest('tr')[0]){
                    var rowIndex = oTable.fnGetPosition($('button[name='+id+']').closest('tr')[0]);
                    console.log(rowIndex);
                
                    if(field.status){
                        oTable.fnUpdate( field.status, rowIndex , 0); 
                        oTable.fnUpdate( buttons(id,field.status), rowIndex , 7);                
                    }else{
                        var begin = question.question.substring(0,20); 
                        if(question.question.length > 20)
                             begin += "...";
                        var categoryName = Categories.findOne({_id:question.categoryId}).name;
                        oTable.fnUpdate(categoryName,rowIndex,1);
                        oTable.fnUpdate(begin,rowIndex,2);
                        for(var i = 0; i<4; i++){
                            if(i == question.correctAnswer){
                                oTable.fnUpdate('<FONT COLOR="green">'+question.answer[i].option+'</FONT>',rowIndex,3+i);
                            }
                            else{
                                oTable.fnUpdate(question.answer[i].option,rowIndex,3+i)
                            }
    
                        }
                    }
                }
            });

        },
        removed : function(id){
            Deps.afterFlush(function(){
                var question = Questions.findOne({_id:id});
                var oTable = $('#question-table').dataTable(); 
                if($('button[name='+id+']').closest('tr')[0]){
                    var oTable = $('#question-table').dataTable();
                    var rowIndex = oTable.fnGetPosition($('button[name='+id+']').closest('tr')[0] );
                    oTable.fnDeleteRow(rowIndex); 
                }
            });

        }
    });
}
Template.editQuestionModal.rendered = function(){

    $('input.form-control').each(function(i,field){

        if(previousValues[i]){
 
            $(field).val(previousValues[i]);
        }
    });
    $('input[type="radio"]').each(function(i,radio){
        if(previousRadioValues[i]){

            radio.checked = previousRadioValues[i];
        }

    });

}
Template.question_table.rendered = function () {

    $('#edit-question-modal').on('hidden.bs.modal', function() {
        Session.set("rerender",false);
        Session.set("rerender",true);
        similarQuestions = [];
        previousValues =[];
        previousRadioValues=[];
        questionsDep.changed();
        _.each($('input'),function(field){
            $(field).val("");
        });
    });  
    try{
        var oTable = $('#question-table').dataTable();
        rendered = true; 
    }catch(err){
        console.log("err");
    }
    if(!rendered){
        prepareDataSet();
        $('#question-table').remove(); 
        $('#table-container').append('<div><table cellpadding="1" cellspacing="0" border="5" class="display" id="question-table"></table></div>');
        if(Meteor.user().isAdmin || Meteor.user().isModerator){
            $('#question-table').dataTable( {
                "aaData": tableData,
                "aoColumns": [
                    { "sTitle": "status" },
                    { "sTitle": "category" },
                    { "sTitle": "question" , "sWidth": "20%"},
                    { "sTitle": "answer" },
                    { "sTitle": "answer" },
                    { "sTitle": "answer" },
                    { "sTitle": "answer" },
                    { "sWidth": "20%", "bSortable": false, "sTitle": "" },
                    { "sWidth": "5%", "bSortable": false, "sTitle": "" },

                ],
                sPaginationType: "full_numbers"
            } ); 
            rendered = true; 
        }else{
            $('#question-table').dataTable( {
                "aaData": tableData,
                "aoColumns": [
                    { "sTitle": "status" },
                    { "sTitle": "category" },
                    { "sTitle": "question" , "sWidth": "20%"},
                    { "sTitle": "answer" },
                    { "sTitle": "answer" },
                    { "sTitle": "answer" },
                    { "sTitle": "answer" },
                    { "sWidth": "20%", "bSortable": false, "sTitle": "" },
     
                ],
                sPaginationType: "full_numbers"
            } ); 
            rendered = true;             
        }
    }
};

Template.question_table.events({
    'click .bulk-delete':function(){
        _.each($('input[type=checkbox]'),function(checkbox){
            if($(checkbox).prop('checked')){
                console.log(checkbox.name);
                var oTable = $('#question-table').dataTable();
                var rowIndex = oTable.fnGetPosition( $(checkbox).closest('tr')[0] );
                oTable.fnDeleteRow(rowIndex); 
                Meteor.call('removeQuestion',checkbox.name);
            }
        });
    },
    'click .bulk-approve':function(){
        _.each($('input[type=checkbox]'),function(checkbox){
            if($(checkbox).prop('checked')){
                var oTable = $('#question-table').dataTable();
                var rowIndex = oTable.fnGetPosition( $(checkbox).closest('tr')[0] ); 
                var value = oTable.fnGetData($(checkbox).closest('tr')[0])[0];  
                if(value == "pending"){
                    var update = "approved";
                    oTable.fnUpdate( update, rowIndex , 0);  
                    oTable.fnUpdate( buttons(checkbox.name,update), rowIndex , 7);
                    Meteor.call('changeQuestionStatus',checkbox.name,update,function(err,res){

                    });
                }
            }
        });
    },
    'click glyphicon': function(evt){
        evt.preventDefault();
    },
    'click .delete': function(evt){
        var name = evt.target.parentNode.name+evt.target.name;
        name = name.replace("undefined","");
        var oTable = $('#question-table').dataTable();
        var rowIndex = oTable.fnGetPosition( $(evt.target).closest('tr')[0] );
        oTable.fnDeleteRow(rowIndex);   
        Meteor.call('removeQuestion',name);
    },
    'click .change': function(evt){
        var name = evt.target.parentNode.name+evt.target.name;
        name = name.replace("undefined","");
        var oTable = $('#question-table').dataTable();
        var rowIndex = oTable.fnGetPosition( $(evt.target).closest('tr')[0] ); 
        var value = oTable.fnGetData($(evt.target).closest('tr')[0])[0];  
        var update = (value == "pending") ? "approved" : "pending";
        oTable.fnUpdate( update, rowIndex , 0);  
        oTable.fnUpdate( buttons(name,update), rowIndex , 7);
        Meteor.call('changeQuestionStatus',name,update,function(err,res){

        });
    },
    'click .edit': function(evt){
        var name = evt.target.parentNode.name+evt.target.name;
        name = name.replace("undefined","");
        console.log(name);
        Session.set("currentStage","editQuestion");
        var oTable = $('#question-table').dataTable();
        var rowIndex = oTable.fnGetPosition( $(evt.target).closest('tr')[0] ); 
        Session.set("selectedRow",rowIndex);
        Session.set("edited",name);
        Session.set('editing-question-' + name, true);
        $('#edit-question-modal').modal('show');
    }, 
    'click .create-category' : function(){
        $('input.form-control').each(function(i,field){
            previousValues[i]=$(field).val();
        });

        $('input[type="radio"]').each(function(i,radio){
            previousRadioValues[i] = radio.checked;
        });

        Session.set("previousStage",Session.get("currentStage"));
        Session.set("currentStage","addCategory");
    }, 
    'click .back': function(){
        Session.set("currentStage",Session.get("previousStage"));
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
    },
    'rerender':function(){
        return Session.get("rerender");
    }
});

Template.modalfooter.helpers({
    'category' : function(){
        return Session.get("currentStage")=="addCategory";
    },
    'addQuestion':function(){
 
        return Session.get("currentStage") == "addQuestion";
    },
    'rerender':function(){
    
        return Session.get("rerender");
    }
});