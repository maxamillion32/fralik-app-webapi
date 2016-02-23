var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({

    username : {type: String, unique: true},
    password : {type: String},
    isactive :  {type: Boolean, default: true}
});

var User = mongoose.model('users'/*Collection name*/, userSchema);
module.exports = User;