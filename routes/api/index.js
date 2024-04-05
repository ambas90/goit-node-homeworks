const express = require("express");
const router = express.Router();

const {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  putContact,
} = require("../../controllers");

router.get("/contacts/", getAllContacts);
// router.get("/contacts/:contactId", getContactById);
router.post("/contacts/", createContact);
// router.put("contacts/:contactId", putContact);
// router.delete("contacts/:contactId", deleteContact);

module.exports = router;
