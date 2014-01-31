
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

Facebook.prototype.getUserFriends = function() {
    var query = "SELECT uid2 FROM friend WHERE uid1=me()"; 
    var data = this.fqlQuery(query); 
    return data;
}


Meteor.methods({

    getUserFriends: function(user) { 
        console.log("getting user friends");
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
                    //console.log('id :' + resp.result.data[friend]['uid2'].toString());
                    var query = {'services.facebook.id': resp.result.data[friend]['uid2'].toString()};
                    var user_friend = Meteor.users.findOne(query); 
                    if(user_friend){
                        var first = user_friend.services.facebook.first_name; 
                        var last = user_friend.services.facebook.last_name;
                        console.log("your friend " + first +" "+last+" is logged in!");                    
                    }

                }                
            }

        });
    }
});