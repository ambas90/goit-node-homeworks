const { fetchContacts, insertContact } = require("./services");

const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await fetchContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

const createContact = async (req, res, next) => {
  const { name, email, phone, favorite } = req.body;
  try {
    const result = await insertContact({ name, email, phone, favorite });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllContacts, createContact };
