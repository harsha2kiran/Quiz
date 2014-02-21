Meteor.startup(function () {

 var makeBadge = function(name,points,icon){
    Badges.insert({name: name,points: points, icon: icon});
 }
 if(Badges.find().fetch().length == 0){
    makeBadge("badge1",10,"/badge_1.jpg");
    makeBadge("badge2",15,"/badge_2.jpg");
    makeBadge("badge3",40,"/badge_3.jpg");
 }
});

