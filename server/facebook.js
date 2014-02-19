
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
      console.log(res); // { id: xxxxx}
    });
}

Meteor.methods({
    getFacebookCode: function(){
        var graph = Meteor.require('fbgraph');
        var authUrl = graph.getOauthUrl({

        "client_id":  "250844995088258",
        "redirect_uri":  Meteor.absoluteUrl("facebook"),
        "scope": " email, user_friends, user_location,user_events,friends_events, friends_location,friends_about_me,user_status,friends_status,read_friendlists,user_photos,publish_stream"

        });
        
        return authUrl;
    },
    getFacebookAccessToken: function(query,id){
        console.log("id");
        console.log(id);
        var self = this; 
        var graph = Meteor.require('fbgraph'); 
            graph.authorize({
                "client_id":      "250844995088258",
                "redirect_uri":   Meteor.absoluteUrl("facebook"),
                "client_secret":  "be5eac28e0b084fa4cd4783620af2fef",
                "code":           query
            }, Meteor.bindEnvironment(
                function (err, facebookRes) {
                    console.log(facebookRes);
                    var updates = {}; 
                    updates['services.facebook.accessToken'] = facebookRes.access_token; 
                    updates['servoces.facebook.forInvite'] = true;
                    Meteor.users.update({_id:id},
                        {$set:updates},
                        function(err,res){
                            if(err)
                                console.log("an error"+err+"occured");

                    }); 
                },
                function(e){
                    console.log('bind failure');
                }
            ));
    },
    getUserFriends: function(user) { 
        var fb = new Facebook(user.services.facebook.accessToken);
        var data = fb.getUserFriends();
        return data;
    }, 

    getUserFacebookData: function() {
        var fb = new Facebook(Meteor.user().services.facebook.accessToken);
        var data = fb.getUserData();
        return data;
    },
    checkUserFriends: function(user){
        Meteor.call('getUserFriends',user,function(err,resp){
            if(err){
                console.log(err);
            }
            else{
                for(var friend in resp.result.data){
                    if(resp.result.data[friend]['uid2']){
                        var query = {'services.facebook.id': resp.result.data[friend]['uid2'].toString()};
                        var user_friend = Meteor.users.findOne(query); 
                        if(user_friend){
                            Meteor.call('makeFriends',user_friend,user._id);             
                        }
                    }
                }                
            }
        });
    }, 
    getFacebookFriendsNames: function(){
        var fb = new Facebook(Meteor.user().services.facebook.accessToken); 
        var friends = fb.getFriendsNames(); 
        if(friends.result){
            return friends.result.data;
        }
        
    }, 
    postOnWall: function(id){
        var fb = new Facebook(Meteor.user().services.facebook.accessToken); 
        fb.postOnWall(id);
    }
});