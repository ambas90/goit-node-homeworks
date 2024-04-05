const Contact = require("../models/Contact");
const fetchContacts = () => {
  return Contact.find();
};

const insertContact = ({ name, email, phone, favorite }) => {
  return Contact.create({ name, email, phone, favorite });
};

module.exports = { fetchContacts, insertContact };
