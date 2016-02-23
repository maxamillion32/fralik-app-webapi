var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var User = require('../Lib/User');
var Event = require('../Lib/Event');
var Profile = require('../Lib/Profile');

var secret = 'saldjjakdhadlkqwiekasdljafaljsnadiwsx';

/* GET healthtest */
router.get('/healthtest', function(req, res, next) {
  res.json({ message: "Status Okay" });
});

router.post('/login', function(req, res){

    var username = req.body.username;
    var password = req.body.password;
    console.log("Recieved values are " + username + " " +password);

    User.findOne({username: username, password: password}, function(err, user){
        if(err){
                console.log("err");
            }
        else{
            if(!user){
                    console.log("No user found");
                    res.status(404).json({message : "Username not found"});
                }
            else{
                    var payload = { user: user.username };
                    var token = jwt.encode(payload, secret);

                    var responseObject = {  message : "Successfully logged in.",
                                            username: user.username,
                                            token: token    };
                    res.status(200).json(responseObject);
            }
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
    
    var newuser = new User();
    newuser.username = username;
    newuser.password = password;
    /*newuser.phonenumber = phonenumber;
    newuser.firstname = firstname;
    newuser.lastname = lastname;*/

    newuser.save(function(err, savedUser){
    
        if(err){
            console.log("LOG: /Register - Couldnot register the user");
            //console.log(err);
            var responseObject = {message : "Error!"};
            return   res.status(500).send(responseObject);
        }
    });
    
    
    var newProfile = new Profile();
    newProfile.username = username;
    newProfile.phonenumber = phonenumber;
    newProfile.firstname = firstname;
    newProfile.lastname = lastname;
    
    newProfile.save(function(err, savedProfile){
        
        if(err){
            console.log("LOG: /Register - Couldnot create the user profile");
            Profile.remove({username: username});
            
            var responseObject = {message : "Error!"};
            return   res.status(500).send(responseObject);
        }
        else{
            
            var responseObject = {  message : "Successfully Registered"};
                    res.status(200).json(responseObject);
            
        }
        
    });
    
    
    
    
});

router.get('/profile/:username', function(req, res){
    
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

router.put('/profile/:username', function(req, res){
    
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

    Profile.findOneAndUpdate(condition, updatevalues, {upsert: true},function(err, updatedValues){
        
            if(err){
                console.log(err);
                res.status(500).send({message : "Error updating the values."});
            }
            else{
                var responseobject = { 
                                    message     : "Success",
                                    username    : finduser,
                                    details     : updatedValues
                                };
                res.status(200).send(responseobject);
            }
    });

    
});


router.post('/createevent', function(req, res){
    
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
            
console.log("Recieved values are   "+ req.body.pickUpLocationLat
                                +" "+ req.body.pickUpLocationLng);

console.log("Recieved values are   "+ req.body.eventLocation
                                +" "+ req.body.pickUpLocation);
    
    var newEvent = new Event();
    
    newEvent.username   = req.body.username;
    
    newEvent.eventname  = req.body.eventName;
    newEvent.eventtype  = req.body.eventType;
    
    newEvent.seatsavailable = req.body.seatsAvailable;
    newEvent.preferences    = req.body.preferences;
    
    newEvent.dateday    = req.body.dateDay;
    newEvent.datemonth  = req.body.dateMonth;
    newEvent.dateyear   = req.body.dateYear;
    
    newEvent.eventtimehour   = req.body.eventTimeHour;
    newEvent.eventtimeminute = req.body.eventTimeMinute
                                
    newEvent.pickuptimehour   = req.body.pickUpTimeHour;
    newEvent.pickuptimeminute = req.body.pickUpTimeMinute;
                                
    newEvent.eventlocationlat = req.body.eventLocationLat;
    newEvent.eventlocationlng = req.body.eventLocationLng;
            
    newEvent.pickuplocationlat = req.body.pickUpLocationLat;
    newEvent.pickuplocationlng = req.body.pickUpLocationLng;

    newEvent.eventlocation = req.body.eventLocation;
    newEvent.pickuplocation = req.body.pickUpLocation;
    
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

/*router.post('/createevent', middlewareAuth,function(req, res){});
router.get('/getevents', middlewareAuth,function(req, res){})
router.post('/requestevent', middlewareAuth,function(req, res){});
router.post('/accepterequest', middlewareAuth,function(req, res){});*/

module.exports = router;