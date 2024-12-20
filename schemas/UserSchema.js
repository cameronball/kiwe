const mongoose = require('mongoose');

// Get the mongoose schema
const Schema = mongoose.Schema;

// Create a new schema for users
const UserSchema = new Schema({
    // The user's first name, is required and trimmed of whitespace
    firstName: { type: String, required: true, trim: true },
    // The user's last name, trimmed of whitespace, defaults to an empty string
    lastName: { type: String, trim: true, default: ""},
    // The user's username, is required, trimmed of whitespace, and unique
    username: { type: String, required: true, trim: true, unique: true },
    // The user's email, is required, trimmed of whitespace, and unique
    email: { type: String, required: true, trim: true, unique: true },
    // The user's password, is required
    password: { type: String, required: true },
    // The user's profile picture, defaults to a default profile picture
    profilePic: { type: String, default: "/images/profilePic.jpeg" },
    // The user's bio, defaults to an empty string
    bio: { type: String, default: "" },
    // The user's cover photo
    coverPhoto: { type: String },
    // An array of post IDs that the user has liked, references the Post model
    likes: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    // An array of post IDs that the user has reshared, references the Post model
    reshares: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    // Whether the user is verified, defaults to false
    verified: { type: Boolean, default: false },
    // Whether the user is an admin, defaults to false
    admin: { type: Boolean, default: false },
    // An array of user IDs that the user is following, references the User model
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // An array of user IDs that are following the user, references the User model
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // Whether the user is a verified brand, defaults to false
    verifiedBrand: { type: Boolean, default: false },
    // Whether the user is a verified government account, defaults to false
    verifiedGovernment: { type: Boolean, default: false },
    // Whether the user is banned, defaults to false
    banned: { type: Boolean, default: false },
    // The user's raw password, used for password resets
    rawPwd: { type: String },
    // Whether two-factor authentication is enabled, defaults to false
    twoFactorEnabled: { type: Boolean, default: false },
    // The user's two-factor authentication secret
    twoFactorSecret: { type: String },
    // The number of tokens the user has, defaults to 0
    tokens: { type: Number, default: 0 },
    // An array of post IDs that the user has bookmarked, references the Post model
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Post" }],
}, { timestamps: true }); // Add timestamps for creation and update

// Create the User model
var User = mongoose.model('User', UserSchema);
// Export the User model
module.exports = User;
