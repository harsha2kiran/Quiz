
function Facebook(accessToken) {
    this.fb = Meteor.require('fbgraph');
    this.accessToken = accessToken;
    this.fb.setAccessToken(this.accessToken);
    this.options = {
        timeout: 3000,
        pool: {maxSockets: Infinity},
        headers: {connection: "keep-alive"}
    }
    this.fb.setOptions(this.options);
}

var FB = Meteor.require('fb');


Facebook.prototype.fqlQuery = function(query){
    var self = this; 
    var data = Meteor.sync(function(done){
        self.fb.fql(query,function(err,res){
            done(null,res);
        });
    });
    return data;
}
Facebook.prototype.graphQuery = function(query, method) {
    var self = this;
    var method = (typeof method === 'undefined') ? 'get' : method;
    var data = Meteor.sync(function(done) {
        self.fb[method](query, function(err, res) {
            done(null, res);
        });
    });
    return data.result;
}

Facebook.prototype.getUserData = function() {
    var query = "SELECT name FROM user WHERE uid = me()";
    var data = this.fqlQuery(query);
    return data;     
}


Facebook.prototype.getUserID = function() {
    var query = "SELECT uid2 FROM user WHERE uid = me()";
    var data = this.fqlQuery(query);
    return data;     
}

Facebook.prototype.getUserFriends = function() {
    var query = "SELECT uid2 FROM friend WHERE uid1=me()"; 
    var data = this.fqlQuery(query); 
    return data;
}

Facebook.prototype.getFriendsNames = function(){
    var query = "SELECT name,id FROM profile WHERE id IN (SELECT uid2 FROM friend WHERE uid1=me())"
    var data = this.fqlQuery(query); 
    return data;
}

Facebook.prototype.postOnWall = function(id){
    var wallPost = {
      message: "I'm gonna come at you like a spider monkey, chip!"
    };

    this.fb.post(id + "/feed", wallPost, function(err, res) {
      // returns the post id
    });
}

Meteor.methods({
    getFacebookCode: function(){
        var graph = Meteor.require('fbgraph');
        var authUrl = graph.getOauthUrl({

        "client_id":  "525727080873464",
        "redirect_uri":  Meteor.absoluteUrl("facebook"),
        "scope": " email, user_friends, user_location,user_events,friends_events, friends_location,friends_about_me,user_status,friends_status,read_friendlists,user_photos,publish_stream"

        });
        
        return authUrl;
    },
    getFacebookAccessToken: function(query,id){

        var self = this; 
        var graph = Meteor.require('fbgraph'); 
            graph.authorize({
                "client_id":      "525727080873464",
                "redirect_uri":   Meteor.absoluteUrl("facebook"),
                "client_secret":  "a4ec81736a684d597ee3110409abf957",
                "code":           query
            }, Meteor.bindEnvironment(
                function (err, facebookRes) {
                    var updates = {}; 
                    if(facebookRes.access_token){
                        updates['services.facebook.accessToken'] = facebookRes.access_token; 
                        updates['services.facebook.forInvite'] = true;
                    Meteor.users.update({_id:id},
                        {$set:updates},
                        function(err,res){
                            if(err)
                                console.log("an error"+err+"occured");
                        }); 
                    }
                },
                function(e){
                    console.log('bind failure');
                }
            ));
    },
    getUserFriends: function(user) {
        if(!user.services.facebook){
            return false;
        }
        FB.setAccessToken(user.services.facebook.accessToken);
        var data = Meteor.sync(function(done){
            FB.api('fql', { q : 
               "SELECT uid2 FROM friend WHERE uid1=me()"
             }, function(res) {
              if(!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return;
              }

              done(res.error,res.data);
            });
        });
        return data.result;

    },

    getUserFacebookData: function() {
        var fb = new Facebook(Meteor.user().services.facebook.accessToken);
        var data = fb.getUserData();
        return data;
    },
    checkUserFriends: function(user){
        Meteor.call('getUserFriends',user,function(err,resp){
            console.log()
            if(err){
                console.log(err);
            }
            else{
                for(var friend in resp){
                    if(resp[friend]['uid2']){
                        console.log('friend');
                        console.log(resp[friend]['uid2']);
                        _.each(Meteor.users.find().fetch(),function(fr){
                            if(fr.services.facebook){
                                if(fr.services.facebook.id == resp[friend]['uid2'].toString()){
                                    console.log("mamy");
                                    Meteor.call('makeFriends',fr._id,user._id); 
                                }
                            }
                        });                      
                    }
                }                
            }
        });
    }, 
    getFacebookFriendsNames: function(){
        if(!Meteor.user().services.facebook){
            return false;
        }
        FB.setAccessToken(Meteor.user().services.facebook.accessToken);
        var data = Meteor.sync(function(done){
            FB.api('fql', { q : 
               "SELECT name,id FROM profile WHERE id IN (SELECT uid2 FROM friend WHERE uid1=me())"
             }, function(res) {
              if(!res || res.error) {
                console.log(!res ? 'error occurred' : res.error);
                return;
              }

              done(res.error,res.data);
            });
        });
        return data.result;
        
    }, 
    postOnWall: function(id){
        var fb = new Facebook(Meteor.user().services.facebook.accessToken); 
        fb.postOnWall(id);
    }
});