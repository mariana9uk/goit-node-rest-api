import mongoose from "mongoose";
import { Contact } from "../models/contact.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";

export const getAllContacts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contacts = await Contact.find({ owner: userId });
    res.status(200).send(contacts);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const getOneContact = async (req, res, next) => {
  const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  };
  const { id } = req.params;

  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid contact id" });
    }
    const userId = req.user.id;
    const contact = await Contact.findById(id);
    if (contact === null) {
      res.status(404).json({ message: "Not found" });
    } else {
      if (userId != String(contact.owner)) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.status(200).json(contact);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (contact === null) {
      res.status(404).json({ message: "Not found" });
    } else {
      res.status(200).json({ message: "Contact deleted!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

export const createContact = async (req, res, next) => {
  const check = createContactSchema.validate(req.body, { abortEarly: false });
  const { error } = check;
  if (error) {
    const missingFields = error.details
      .filter((detail) => detail.type === "any.required")
      .map((detail) => detail.context.key);

    if (missingFields.length > 0) {
      res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  } else {
    try {
      const newContact = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        favorite: req.body.favorite,
        owner: req.user.id,
      };
      const contact = await Contact.create(newContact);
      res.status(201).json(contact);
    } catch (error) {
      next(error);
      console.log(error);
    }
  }
};

export const updateContact = async (req, res, next) => {
  const body = req.body;
  const check = updateContactSchema.validate(body, { abortEarly: false });
  const { error } = check;
  if (error) {
    res.status(400).json({ message: `${error.message}` });
  }
  if (Object.keys(body).length === 0) {
    res.status(400).json({ message: "Body must have at least one field" });
  } else {
    try {
      const updatedContact = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        favorite: req.body.favorite,
      };
      const contactId = req.params.id;
      const contact = await Contact.findByIdAndUpdate(
        contactId,
        updatedContact,
        { new: true }
      );
      if (contact === null) {
        res.status(404).json({ message: "Not found" });
      } else {
        res.status(200).json(contact);
      }
    } catch (error) {
      next(error);
    }
  }
};

export const updateStatusContact = async (req, res, next) => {
  const body = req.body;
  const check = updateContactSchema.validate(body, { abortEarly: false });
  const { error } = check;
  if (error) {
    res.status(400).json({ message: `${error.message}` });
  }
  if (Object.keys(body).length === 0) {
    res.status(400).json({ message: "Body must have at least one field" });
  } else {
    try {
      const contactId = req.params.id;
      const contact = await Contact.findByIdAndUpdate(
        contactId,
        { favorite: req.body.favorite },
        { new: true }
      );
      if (contact === null) {
        res.status(404).json({ message: "Not found" });
      } else {
        res.status(200).json(contact);
      }
    } catch (error) {
      next(error);
    }
  }
};
