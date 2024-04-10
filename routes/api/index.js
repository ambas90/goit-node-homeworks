const express = require("express");
const router = express.Router();

const {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  putContact,
  patchContact,
} = require("../../controllers");

router.get("/contacts/", getAllContacts);
router.get("/contacts/:id", getContactById);
router.post("/contacts/", createContact);
router.put("/contacts/:id", putContact);
router.delete("/contacts/:id", deleteContact);
router.patch("/contacts/:id/favorite", patchContact);
module.exports = router;
