var mongoose = require('mongoose');

var profileSchema = new mongoose.Schema({

    username : {type: String, unique: true},
    firstname: String,
    lastname:  String,
    phonenumber: String,
    avatar: {type: String, default: "1"},
    emergencycntname1: {type: String, default: ""},
    emergencycntname2: {type: String, default: ""},
    emergencycntnumber1: {type: String, default: ""},
    emergencycntnumber2: {type: String, default: ""}
});

var Profile = mongoose.model('profile'/*Collection name*/, profileSchema);
module.exports = Profile;