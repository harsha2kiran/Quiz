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
 var makeBadge = function(name,points,icon){
    Badges.insert({name: name,points: points, icon: icon});
 }
 if(Badges.find().fetch().length == 0){
    makeBadge("badge1",10,"/badge_1.jpg");
    makeBadge("badge2",15,"/badge_2.jpg");
    makeBadge("badge3",40,"/badge_3.jpg");
 }
});

