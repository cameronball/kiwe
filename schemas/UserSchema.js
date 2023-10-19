const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: ""},
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "/images/profilePic.jpeg" },
    coverPhoto: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    reshares: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    verified: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    verifiedBrand: { type: Boolean, default: false },
    verifiedGovernment: { type: Boolean, default: false },
}, { timestamps: true });

var User = mongoose.model('User', UserSchema);
module.exports = User;