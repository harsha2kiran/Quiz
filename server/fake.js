Meteor.startup(function () {

  var makeUser = function(email,role) {

    var uid = undefined, user = Meteor.users.findOne({role: role});
    console.log(user);
    if (!user){
        try{
          uid = Accounts.createUser({email: email, password: 'password'});     
        }catch(err){

        }
        
 
    }
    else {
      uid = user._id;
    }


      Meteor.users.update({_id: uid}, {$set: {
        isFake   : true,
        role     : role,
      }});

 };

 /* makeUser('admin@admin.com', "admin");
  makeUser('moderator@moderator.com', "editor"); 
*/
});

