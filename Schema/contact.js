const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;