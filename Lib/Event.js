var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({

    username: String,
    
    eventname   : String,
    eventtype   : String,
    privacytype : Number,               // Public: 0 Unlisted: 1 // Not boolean because may add different types in future
    seatsavailable: Number,
    preferences: String,
    
    dateday     :  Number,
    datemonth   :  Number,
    dateyear    :  Number,
    
    eventtimehour: Number,
    eventtimeminute: Number,
        
    eventlocationlat: Number,
    eventlocationlng: Number,
    eventlocation: String,
    
    pickup: [{pickuptime: String, pickuplocation: String}]

});

var Event = mongoose.model('events'/*Collection name*/, eventSchema);
module.exports = Event;



/*{
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
}*/