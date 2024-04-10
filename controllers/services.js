const Contact = require("../models/Contact");
const fetchContacts = () => {
  return Contact.find();
};

const fetchContact = (id) => {
  return Contact.findById({ _id: id });
};

const insertContact = ({ name, email, phone, favorite }) => {
  return Contact.create({ name, email, phone, favorite });
};

const updadeContact = async ({ id, toUpdate, upsert = false }) => {
  return Contact.findByIdAndUpdate(
    { _id: id },
    { $set: toUpdate },
    { new: true, runValidators: true, strict: "throw", upsert }
  );
};

const updateStatusContact = async ({ id, favorite }) => {
  return Contact.findByIdAndUpdate({ _id: id }, { favorite }, { new: true });
};

const removeContact = (id) => Contact.deleteOne({ _id: id });

module.exports = {
  fetchContacts,
  fetchContact,
  insertContact,
  updadeContact,
  removeContact,
  updateStatusContact,
};
