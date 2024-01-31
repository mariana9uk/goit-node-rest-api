// import contactsService from "../services/contactsServices.js"
// import express from "express";
import HttpError from "../helpers/HttpError.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";
import {
  ChangeContact,
  addContact,
  getContactById,
  listContacts,
  removeContact,
} from "../services/contactsServices.js";

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {}
};

export const getOneContact = async (req, res) => {
  try {
    const contact = await getContactById(req.params.id);
    if (contact === null) {
      res.status(404).json({ message: "Not found" });
    } else {
      res.status(200).json(contact);
    }
  } catch (error) {}
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await removeContact(req.params.id);
    if (contact === null) {
      res.status(404).json({ message: "Not found" });
    } else {
      res.status(200).json({ message: "Contact deleted!" });
    }
  } catch (error) {}
};

export const createContact = async (req, res) => {
  const body = req.body;
  const { error } = createContactSchema.validate(body);
  const check = createContactSchema.validate(body)
  console.log(check)
  if (error) {
    res.status(400).json({ message: `${error.message}` });
    console.log(error)
  } else {
    try {
      const contact = await addContact(body);
      res.status(201).json(contact);
    } catch (error) {}
  }
};

export const updateContact = async (req, res) => {
  const body = req.body;
  console.log(body);
  const { error } = updateContactSchema.validate(body);
  if (error) {
    res.status(400).json({ message: `${error.message}` });
  }
  if (Object.keys(body).length === 0) {
    res.status(400).json({ message: "Body must have at least one field" });
  } else {
    try {
      const contactId = req.params.id;
      console.log(contactId);
      const contact = await ChangeContact(contactId, body);
      console.log(contact);
      if (contact === null) {
        res.status(404).json({ message: "Not found" });
      } else {
        res.status(200).json(contact);
      }
    } catch (error) {}
  }
};
