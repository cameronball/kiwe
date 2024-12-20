const mongoose = require('mongoose');

// Get the mongoose schema
const Schema = mongoose.Schema;

// Create a new schema for Paris logs
const ParisLogSchema = new Schema({
    // The request sent to Paris, trimmed of whitespace
    request: { type: String, trim: true },
    // The ID of the user who sent the request, references the User model and is required
    sentBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // The response from Paris, trimmed of whitespace
    response: { type: String, trim: true },
}, { timestamps: true }); // Add timestamps for creation and update

// Export the ParisLog model
module.exports = mongoose.model('ParisLog', ParisLogSchema);
