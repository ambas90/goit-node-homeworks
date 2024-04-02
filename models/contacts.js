const fs = require("fs/promises");
const path = require("path");

const contactsFilePath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  const data = await fs.readFile(contactsFilePath, "utf8");
  const contacts = JSON.parse(data);
  return contacts;
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const contact = contacts.find(
    (contact) => contact.id.toString() === contactId
  );
  return contact;
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const updatedContacts = contacts.filter(
    (contact) => contact.id !== contactId
  );
  await fs.writeFile(
    contactsFilePath,
    JSON.stringify(updatedContacts, null, 2)
  );
};

const addContact = async (body) => {
  const contacts = await listContacts();
  contacts.push(body);
  await fs.writeFile(contactsFilePath, JSON.stringify(contacts, null, 2));
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const index = contacts.findIndex((contact) => contact.id === contactId);

  const updatedContact = { ...contacts[index], ...body };
  contacts[index] = updatedContact;
  await fs.writeFile(contactsFilePath, JSON.stringify(contacts, null, 2));
  return updatedContact;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
