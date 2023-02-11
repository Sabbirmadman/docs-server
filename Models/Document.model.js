const { Schema, model } = require("mongoose");

const Document = new Schema({
    _id: String,
    documentName: String,
    data: Object,
    createdBy: String,
    createdAt: Date,
    viewToAll: Boolean,
    editToAll: Boolean,
    viewTo: [String],
    editTo: [String],
});

module.exports = model("Document", Document);
