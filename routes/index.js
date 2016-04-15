var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var bcrypt = require('bcrypt');
var User = require('../Lib/User');
var Event = require('../Lib/Event');
var Profile = require('../Lib/Profile');
var Requests = require('../Lib/Requests');
var secret = 'saldjjakdhadlkqwiekasdljafaljsnadiwsx';

// Middleware that authenticates all the secret pages
function checkAuth(req, res, next){
    var token = req.headers.token;
    console.log(token);
    
    if (token) {    
        try{
            var decoded = jwt.decode(token, secret);
            req.decoded = decoded;
            next();
        }
        catch(err)
        {
            console.log("Error decoding the token");
            res.status(403).json({ message: "Invalid user"});
        }
    }
    else{
        res.status(403).json({ message: "Invalid user"});
    }
};


//** EndPoints **//

/* GET healthtest */
router.get('/healthtest', function(req, res, next) {
  res.json({ message: "Status Okay" });
});

router.post('/login', function(req, res){

    var username = req.body.username;
    var password = req.body.password;

    console.log("Recieved values are " + username + " " +password);

    User.findOne({username: username}, function(err, user){
        if(err){
                console.log("err");
                res.status(404).jsonp({message : "Username not found"});
            }
        else{

                bcrypt.compare(password, user.password, function(err, success) {
    
                    if(err){
                            console.log(err);
                            console.log(JSON.stringify(res));

                            res.status(403).json({message : "Invalid User"});
                        }
                        else{
                            
                            var payload = { user: user.username };
                            var token = jwt.encode(payload, secret);

                            var responseObject = {  message : "Successfully logged in.",
                                                    username: user.username,
                                                    token: token    };

                            res.status(200).json(responseObject);
                        }                    
                    });
        }
    });    
});

router.post('/register', function(req, res){

    var username    = req.body.username;
    var password    = req.body.password;
    var phonenumber = req.body.phonenumber;
    var firstname   = req.body.firstname;
    var lastname    = req.body.lastname;

    console.log("Recieved values are " + username + " " +password +" "+ phonenumber +" "+firstname+" "+lastname);
    
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, function(err, hash) {
    
        if(err){
            console.log("LOG: /Register - Error Salting the password");
            var responseObject = {message : "Error!"};
            res.status(500).send(responseObject);
        }else{
            console.log("The salted password is "+hash);
            var newuser = new User();
            newuser.username = username;
            newuser.password = hash;
            
            newuser.save(function(err, savedUser){

                if(err){
                    console.log("LOG: /Register - Couldnot register the user new user could not be created");
                    var responseObject = {message : "Error!"};
                    res.status(500).send(responseObject);
                }else{
                    
                    var newProfile = new Profile();
                    newProfile.username = username;
                    newProfile.phonenumber = phonenumber;
                    newProfile.firstname = firstname;
                    newProfile.lastname = lastname;

                    newProfile.save(function(err, savedProfile){
                        if(err){
                            console.log("LOG: /Register - Couldnot create the user profile. ");
                            var responseObject = {message : "Error!"};
                            res.status(500).send(responseObject);
                        }
                        else{
                            var responseObject = {  message : "Successfully Registered"};
                            res.status(200).json(responseObject);
                        }
                    });    
                    
                }
            });
        }
    });
});


/* GET USER PROFILE DETAILS */
router.get('/profile/:username', checkAuth, function(req, res){
    
    var finduser = req.params.username;
    
    Profile.findOne({username: finduser}, function(err, foundProfile){

        if(err){
            console.log(err);
            res.status(500).jsonp({message: "Error fetching resource"});
        }
        else{
            var responseobject = { 
                                    username    : finduser,
                                    details     : foundProfile
                                };
            
            res.status(200).jsonp(responseobject);
        }
    });

});

/* UPDATE USER PROFILE DETAILS */
router.put('/profile/:username', checkAuth,function(req, res){
    
    var finduser = req.params.username;
    console.log(finduser);

    var firstname   = req.body.firstname;
    var lastname    = req.body.lastname;
    var phonenumber = req.body.phonenumber;
    
    var avatar = req.body.avatar;
    var emergencycntname1 = req.body.emergencycntname1;
    var emergencycntname2 = req.body.emergencycntname2;
    var emergencycntnumber1 = req.body.emergencycntnumber1;
    var emergencycntnumber2 = req.body.emergencycntnumber2;
    
    
    console.log("Recieved values are   "+ req.body.firstname
                                +" "+ req.body.lastname
                                +" "+ req.body.avatar
                                +" "+ req.body.phonenumber);
    
    console.log("Recieved values are "+ req.body.emergencycntname1
                                +" "+ req.body.emergencycntname2
                                +" "+ req.body.emergencycntnumber1
                                +" "+ req.body.emergencycntnumber2);
    
    
    var condition = {username : finduser};
    var updatevalues = {$set: { firstname : firstname,
                                lastname: lastname, 
                                phonenumber: phonenumber,
                                avatar: avatar,
                                emergencycntname1: emergencycntname1,
                                emergencycntname2: emergencycntname2,
                                emergencycntnumber1: emergencycntnumber1,
                                emergencycntnumber2: emergencycntnumber2
                              }
                       };
    
    var condition_1 = {requesteduser : finduser};
    var updatevalues_1 = {$set: {requesteduseravatar: avatar}}

    Profile.findOneAndUpdate(condition, updatevalues, {upsert: true},function(err, updatedValues){
        
            if(err){
                console.log(err);
                res.status(500).send({message : "Error updating the values."});
            }
            else{
                
                Requests.update(condition_1, updatevalues_1, {multi: true}, function(err, update){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("updated");
                    }
                } );
                
                var responseobject = { 
                                    message     : "Success",
                                    username    : finduser,
                                    details     : updatedValues
                                };
                res.status(200).send(responseobject);
            }
    });

    
});
/* Get all the events */
router.get('/events', checkAuth,function(req, res){
    
    
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
});


/* Get All the events created by a user*/
router.get('/events/:username', checkAuth,function(req, res){
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
});

/* Get a specific  event based on the parameter */
router.get('/event/:eventid', checkAuth,function(req, res){
    
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
});

/* Create Event endpoint */
router.post('/createevent', checkAuth, function(req, res){
    
/*
Sample Event JSON POST
{
"username":"haha",
"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiaGFoYSJ9.mhoPQprPVe1B8jRrNlJBZXEq6ou24pEsYaxEFlj1bYA",

"eventName":"event name",
"eventType":"type",
"seatsAvailable":"4",
"preferences":"female",

"dateDay":"25",
"dateMonth":"1",
"dateYear":"2016",

"eventTimeHour":"4",
"eventTimeMinute":"24",

"pickUpTimeHour":"4",
"pickUpTimeMinute":"15",

"eventLocationLat":"38.5853955",
"eventLocationLng":"-121.4133355",

"pickUpLocationLat":"38.58563499999999",
"pickUpLocationLng":"-121.415764",

"eventLocation":"1100 Howe Ave, Sacramento, CA 95825, United States",
"pickUpLocation":"1111 Howe Ave #300, Sacramento, CA 95825, United States"
}
*/
    
    var pickup = req.body.pickup;
    console.log("Privacy type is "+req.body.privacyType);
    
    console.log("The object is " + JSON.stringify(pickup));
    console.log("The object is size " + pickup.length);

    
console.log("Recieved values are   "+ req.body.eventName
                                +" "+ req.body.eventType
                                +" "+ req.body.seatsAvailable
                                +" "+ req.body.preferences);
            
 console.log("Recieved values are  "+ req.body.dateDay
                                +" "+ req.body.dateMonth
                                +" "+ req.body.dateYear);

console.log("Recieved values are   "+ req.body.eventTimeHour
                                +" "+ req.body.eventTimeMinute);
                                
console.log("Recieved values are   "+ req.body.pickUpTimeHour
                                +" "+ req.body.pickUpTimeMinute);
                                
console.log("Recieved values are   "+ req.body.eventLocationLat
                                +" "+ req.body.eventLocationLng);

console.log("Recieved values are   "+ req.body.eventLocation
                                +" "+ req.body.pickUpLocation);
    
    var newEvent = new Event();
    
    newEvent.username   = req.body.username;
    
    newEvent.eventname  = req.body.eventName;
    newEvent.eventtype  = req.body.eventType;
    newEvent.privacytype = req.body.privacyType;
    
    newEvent.seatsavailable = req.body.seatsAvailable;
    newEvent.preferences    = req.body.preferences;
    
    newEvent.dateday    = req.body.dateDay;
    newEvent.datemonth  = req.body.dateMonth;
    newEvent.dateyear   = req.body.dateYear;
    
    newEvent.eventtimehour   = req.body.eventTimeHour;
    newEvent.eventtimeminute = req.body.eventTimeMinute
                                
                                
    newEvent.eventlocationlat = req.body.eventLocationLat;
    newEvent.eventlocationlng = req.body.eventLocationLng;
            
    newEvent.eventlocation = req.body.eventLocation;
    newEvent.pickup = pickup;
    
    newEvent.save(function(err, savedEvent){
    
        if(err){
            console.log("LOG: /CreateEvent - Couldnot create the event");
            console.log(err);
            var responseObject = {message : "Error!"};
            return   res.status(500).send(responseObject);
        }
        else
        {
            var responseObject = {message : "Successfully Created an event"};
            res.status(200).json(responseObject);
        }
    });
    
});

/* Update Event endpoint */
router.put('/event', checkAuth, function(req, res){
    /*
    {
    "eventType":"Coding",
    
    "eventLocationLng":"-121.42347339999999",
    "preferences":"Both",
    
    "seatsAvailable":"4",
    "eventLocationLat":"38.5591398",
    
    "eventTimeHour":"17",
    "dateMonth":"2",
    
    "pickup":[
    {"pickuplocation":"Arden-Arcade, CA, USA","pickuptime":"16:45"},
    {"pickuplocation":"McClellan Park, CA, USA","pickuptime":"16:30"}
    ],
    "dateDay":"25",
    
    "eventTimeMinute":"30",
    "username":"Mavharsha",
    
    "privacyType":"0",
    "eventLocation":"6000 J Street, Sacramento, CA 95819, United States",
    
    "dateYear":"2016",
    "eventName":"Hack For Sac"
    }
    */
    
var pickup = req.body.pickup;
console.log("Eventid is "+req.body.eventid);

console.log("Recieved values are   "+ req.body.eventName
                                +" "+ req.body.eventType
                                +" "+ req.body.seatsAvailable
                                +" "+ req.body.preferences);
    
console.log("Privacy type is "+req.body.privacyType);
    
 console.log("Recieved values are  "+ req.body.dateDay
                                +" "+ req.body.dateMonth
                                +" "+ req.body.dateYear);

console.log("Recieved values are   "+ req.body.eventTimeHour
                                +" "+ req.body.eventTimeMinute);

console.log("Recieved values are   "+ req.body.eventLocation);
console.log("Recieved values are   "+ req.body.eventLocationLat
                                +" "+ req.body.eventLocationLng);

console.log("The object is " + JSON.stringify(pickup));
    
    
    var condition = {_id: req.body.eventid};
    var values = {
                    eventname: req.body.eventName,
                    eventtype: req.body.eventType,
                    privacytype : req.body.privacyType,            
                    seatsavailable: req.body.seatsAvailable,
                    preferences: req.body.preferences,

                    dateday     :  req.body.dateDay,
                    datemonth   :  req.body.dateMonth,
                    dateyear    :  req.body.dateYear,

                    eventtimehour: req.body.eventTimeHour,
                    eventtimeminute: req.body.eventTimeMinute,

                    eventlocationlat: req.body.eventLocationLat,
                    eventlocationlng: req.body.eventLocationLng,
                    eventlocation: req.body.eventLocation,

                    pickup: req.body.pickup
                };
    
    
            Event.update(condition, values, function (err, myDocument) {

                                if(err){
                                    console.log(err);
                                    res.status(500).json({message: "Error"});
                                }
                                else
                                {
                                
                                    var condition_1 = { eventid: req.body.eventid},
                                        updatevalue = {$set: {edited: true}},
                                        options = { multi: true }
                                    Requests.update(condition_1,updatevalue, options,function(err, request){
                                        if(err){
                                                res.status(500).json({message: "Error"});
                                        }else{
                                                console.log(JSON.stringify(request));
                                                console.log("Updated the request collection");
                                                res.status(200).json({message: "Success"});
                                        }
                                    });
                                }
            });

});



/* Get updates if Events are requested */
router.get('/editupdate/:username',function(req, res){
    
    var username = req.params.username;
    console.log(username);

        Requests.findOne({requesteduser: username, edited: true}, function(err, request){
           
            if(err){
                res.status(500).jsonp({message : "Error!"});
            }
            else{
                if(request!=null){
                    console.log("Sending"+JSON.stringify(request));
                    
                    var condition = {_id: request._id},
                        values = {$set: {edited: false}};
                    Requests.update(condition, values, function(err, update){
                        
                        if(err){
                            res.status(500).jsonp({message : "Error!"});
                        }
                        else{
                            res.status(200).jsonp(request);
                        }
            
                    });
                                        
                }else{
                    res.status(500).jsonp({message: "Error!"});
                }
            }
        });          
});

/* When someone request you for a ride */
router.post('/request', checkAuth, function(req, res){
   
    
  console.log("Recieved values are   "+ req.body.eventName
                                +" "+ req.body.eventId
                                +" "+ req.body.createdUser
                                +" "+ req.body.requestedUser
                                +" "+ req.body.pickupLocation);
            
 console.log("Recieved values are  "+ req.body.seatsRequested);
    
    var newrequest = new Requests();
    newrequest.eventname = req.body.eventName;

    newrequest.eventid = req.body.eventId;
    newrequest.createduser = req.body.createdUser;
    newrequest.requesteduser = req.body.requestedUser;
    newrequest.seatsrequested = req.body.seatsRequested;
    newrequest.pickupLocation = req.body.pickupLocation;
    newrequest.requesteduseravatar = req.body.requestedUserAvatar;

    newrequest.save(function(err, savedrequest){
        
        if(err){
            
            console.log(err);
            res.status(500).jsonp({message: "Error!"});
        }else{
         
                res.status(200).jsonp({message: "Successfully requested the ride"});
        }  
    })
});

/* Get all the events requested by a User */
router.get('/requests/:username', checkAuth,function(req, res){
    
        var username = req.params.username;
        Requests.find({requesteduser: username},{'__v':0},function(err, request){
        
        if(err){
            res.status(500).jsonp({message : "Error!"});
        }
        else{
            res.status(200).jsonp(request);
        }
    });
    
});

/* Get all the ride requests for a User */
router.get('/riderequests/:username', checkAuth,function(req, res){
    
        var username = req.params.username;
        Requests.find({createduser: username},{'__v':0},function(err, request){
        
        if(err){
            res.status(500).jsonp({message : "Error!"});
        }
        else{
            res.status(200).jsonp(request);
        }
    });
    
});

/* Update ride request, based on event created action (accept or reject)*/
router.put('/request', checkAuth, function(req, res){
    
    var eventid = req.body.eventid;
    var status = req.body.status;
    var requesteduser = req.body.requesteduser;
    var seatsrequested = req.body.seatsrequested;
    
    console.log("Recieved values are "+ req.body.eventid
                                +" "+ req.body.status
                                +" "+  req.body.seatsrequested
                                +" "+ req.body.requesteduser);
    
    var condition = {eventid: eventid, requesteduser: requesteduser};
    var value = {$set: {status: status}};
    
    Requests.update(condition, value, function(err, saved){
        
         if(err){
            res.status(500).jsonp({message : "Error!"});
        }
        else{
               if(status === "Accepted"){
                    Event.findOne({_id: eventid }, function (err, myDocument) {

                        if(err){
                            console.log(err);
                        }
                        else
                        {
                            console.log(myDocument.seatsavailable);                       
                            var remaining = myDocument.seatsavailable - seatsrequested;
                                                        
                            console.log("Remaining seats are "+ remaining);
                            var condition_1 = {$set : { seatsavailable: remaining }};
                            
                            Event.update({_id: eventid}, condition_1,function (err, updated) {

                                            if(err)
                                                {
                                                  console.log("Couldnot insert remaining");
                                                }
                                });   
                    }
               });
               
               }
                res.status(200).jsonp({message: "Successfully updated"});
            }
    });
});

/* For the created user to get notification when other users request a ride */
router.get('/notification/:username', function(req, res){
    
    var username = req.params.username;
    console.log(username);
        
    Requests.findOne({createduser: username, seen: false},{'__v':0},function(err, request){
        
        if(err){
            res.status(500).jsonp({message : "Error!"});
        }
        else{
        
            if(request ==null){
                console.log("null. no request notifications");
            }
            
            if(request!=null){
                var requestid = request._id;
                console.log(requestid);

                var updatevalues = {$set : {seen : true}};
                Requests.update({_id: requestid}, updatevalues, function(err, done){

                    if(err){
                        console.log("Couldnot update seen");
                        res.status(500).jsonp({message : "Error!"});
                    }else{
                        res.status(200).jsonp({message: "Successfully updated"});
                    }
                });  
            }else{
                res.status(404).jsonp({message: "No updates"});
            }
        }
    });
});

/* For the requested user to get notification */
router.get('/notifyrequester/:username', function(req, res){
    
    var username = req.params.username;
    console.log(username);
    
    var condition = 
        { $and: 
         [
             {requesteduser: username}, 
             {requesterseen: false}, 
             {  $or:
                    [ 
                        {status: "Accepted"}, 
                        {status: "Rejected"} 
                    ]
             }
         ]
        };

    Requests.findOne(condition, function(err, request){
        
        if(err){
            res.status(404).jsonp({message: "error"});
        }else{            

                if(request!=null){
                    var requestid = request._id;
                    console.log(requestid);

                    var updatevalues = {$set : {requesterseen : true}};
                    Requests.update({_id: requestid}, updatevalues, function(err, done){

                        if(err){
                            console.log("Couldnot update seen");
                            res.status(500).jsonp({message : "Error!"});
                        }else{
                            res.status(200).jsonp({message: "Successfully updated"});
                        }
                    });  
                }
                else{
                    res.status(404).jsonp({message: "No updates"});
                }
        }
        
    });
        
    
});    



/* Have any events today */
router.get('/event/today/:username/:day/:hour', function(req, res){
    
   var date = new Date(),
       month = date.getMonth(),
       year = date.getFullYear();           // For PST

    var username = req.params.username,
        day = req.params.day,
        hour = req.params.hour;
    
    console.log(req.params);

    console.log("The day and hour is in the params "+ req.params.day+" "+ req.params.hour);
    
    console.log(month +"/"+day+"/"+year);    
    
    Event.findOne({username: username, dateday: day, datemonth: month, dateyear: year}, function(err, event){

        if(err){
            res.status(404).jsonp({message: "Error"});
        }else{
            if(event!=null){
                            res.status(200).jsonp(event);   
            }else{
                            res.status(404).jsonp({message: "Error"});
            }
        }
    });
});
/*router.post('/createevent', middlewareAuth,function(req, res){});
router.get('/getevents', middlewareAuth,function(req, res){})
router.post('/requestevent', middlewareAuth,function(req, res){});
router.post('/accepterequest', middlewareAuth,function(req, res){});*/

module.exports = router;