var EventController = function(Event){
    
    var publicEvents = function(req, res){
    Event.find({privacytype : 0}, function(err, events){
        
        if(err){
                console.log(err);
                var responseobject = {message : "Error"};
                res.status(500).jsonp(responseobject);
            }else{
                var responseobject = {
                                        message: "Success",
                                        details:  events
                                     };
                res.status(200).jsonp(responseobject);   
            }
        });
    };
    
    
    
    var getEventByUser = function(req, res){
    var username = req.params.username;
    
    Event.find({username: username}, function(err, events){
        
            if(err){
                console.log(err);
                var responseobject = {message : "Error"};
                res.status(500).jsonp(responseobject);
            }else{

                var responseobject = {message: "Success",
                                      details:  events
                                     };
                res.status(200).jsonp(responseobject);

            }
        
        });
    };
    
    var getEventByEventId = function(req, res){
    
    var eventid = req.params.eventid;
    console.log(eventid);
    
    Event.find({_id: eventid}, function(err, events){
        
            if(err){
                console.log(err);
                var responseobject = {message : "Error"};
                res.status(500).jsonp(responseobject);
            }else{

                var responseobject = {message: "Success",
                                      details:  events
                                     };
                res.status(200).jsonp(responseobject);

            }
        
        });
    };
    
    return {
        publicEvents: publicEvents,
        getEventByUser: getEventByUser,
        getEventByEventId: getEventByEventId
    };
}

module.exports = EventController;
