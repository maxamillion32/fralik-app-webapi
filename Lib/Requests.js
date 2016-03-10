var mongoose = require('mongoose');

var requestSchema = new mongoose.Schema({

    eventname: String,
    eventid: String,
    requesteduser: String,
    createduser: String,
    seatsrequested: Number,
    requesteduseravatar: String,
    status: {type: Boolean, default: false},      // false: reject, true: accept
    seen: {type: Boolean, default: false}         // false: Unseen, true: Seen
});

var Requests = mongoose.model('requests'/*Collection name*/, requestSchema);
module.exports = Requests;