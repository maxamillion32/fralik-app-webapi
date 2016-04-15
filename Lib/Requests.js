var mongoose = require('mongoose');

var requestSchema = new mongoose.Schema({

    eventname: String,
    eventid: String,
    requesteduser: String,
    createduser: String,
    seatsrequested: Number,
    requesteduseravatar: String,
    pickupLocation: String,
    status: {type: String, default: "Not Decided"},      // Not Decided, Accepted, Rejected
    seen: {type: Boolean, default: false},         // false: Unseen, true: Seen
    requesterseen: {type: Boolean, default: false},
    edited: {type: Boolean, default: false}
});

var Requests = mongoose.model('requests'/*Collection name*/, requestSchema);
module.exports = Requests;