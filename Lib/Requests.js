var mongoose = require('mongoose');

var requestSchema = new mongoose.Schema({

    eventname: String,
    eventid: String,
    requesteduser: String,
    createdUser: String,
    seatsrequested: Number,
    seen: {type: Boolean, default: false}         // false: Unseen, true: Seen
});

var Requests = mongoose.model('requests'/*Collection name*/, requestSchema);
module.exports = Requests;