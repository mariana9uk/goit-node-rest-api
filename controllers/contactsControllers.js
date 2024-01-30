// import contactsService from "../services/contactsServices.js"
// import express from "express";
import HttpError from "../helpers/HttpError.js";
import { createContactSchema, updateContactSchema } from "../schemas/contactsSchemas.js";
import {
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
      res.status(200).json({ message: "Contact created!" });
    }
  } catch (error) {}
};

export const createContact = async (req, res) => {
  const body = req.body;
  const { error } = createContactSchema.validate(body);
  if (error) {
    res.status(400).json({ message: `${error.message}` });
  } else {
    try {
      const contact = await addContact(body);
      res.status(201).json(contact);
    } catch (error) {}
  }
};

export const updateContact = async(req, res) => {
    const body = req.body;
    const { error } = updateContactSchema.validate(body);
    if (error) {
      res.status(400).json({ message: `${error.message}` });
    } 
    else if(body===''){
        res.status(400).json({ message: "Body must have at least one field" });
    }
    else {
      try {
        const contact = await updateContact(body);
        if (contact === null) {
            res.status(404).json({ message: "Not found" });
          } else {
            res.status(200).json(contact);
          }
          } catch (error) {}
    }
};
