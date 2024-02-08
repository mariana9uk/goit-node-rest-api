import { Contact } from "../models/contact.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";
import {
  ChangeContact,
  ChangeStatusContact,
  addContact,
  getContactById,
  listContacts,
  removeContact,
} from "../services/contactsServices.js";


export const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.status(200).send(contacts);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
// export const getAllContacts = async (req, res) => {
//   try {
//     const contacts = await listContacts();
//     res.status(200).json(contacts);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Internal Server Error");
//   }
// };
export const getOneContact = async (req, res) => {
  const {id}=req.params
  try {
    const contact = await Contact.findById(id);
    if (contact === null) {
      res.status(404).json({ message: "Not found" });
    } else {
      res.status(200).json(contact);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
// export const getOneContact = async (req, res) => {
//   try {
//     const contact = await getContactById(req.params.id);
//     if (contact === null) {
//       res.status(404).json({ message: "Not found" });
//     } else {
//       res.status(200).json(contact);
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Internal Server Error");
//   }
// };
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
// export const deleteContact = async (req, res) => {
//   try {
//     const contact = await removeContact(req.params.id);
//     if (contact === null) {
//       res.status(404).json({ message: "Not found" });
//     } else {
//       res.status(200).json({ message: "Contact deleted!" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Internal Server Error");
//   }
// };
export const createContact = async (req, res, next) => {
  const check = createContactSchema.validate(req.body, { abortEarly: false });
  const { error } = check;
  if (error) {
    const missingFields = error.details
      .filter((detail) => detail.type === "any.required")
      .map((detail) => detail.context.key);

    if (missingFields.length > 0) {
      res
        .status(400)
        .json({
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
    } else {
      res.status(400).json({ message: error.message });
    }
  } else {
    try {
      const newContact = {
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        favorite:req.body.favorite

      }
      const contact = await Contact.create(newContact);
               res.status(201).json(contact);
    } catch (error) {
      next(error);
      console.log(error)
    }
  }
};


// export const createContact = async (req, res, next) => {
//   const check = createContactSchema.validate(req.body, { abortEarly: false });
//   const { error } = check;
//   console.log(req.body);
//   console.log(check);
//   if (error) {
//     const missingFields = error.details
//       .filter((detail) => detail.type === "any.required")
//       .map((detail) => detail.context.key);

//     if (missingFields.length > 0) {
//       res
//         .status(400)
//         .json({
//           message: `Missing required fields: ${missingFields.join(", ")}`,
//         });
//     } else {
//       res.status(400).json({ message: error.message });
//     }
//   } else {
//     try {
//       const contact = await addContact(req.body);
//       res.status(201).json(contact);
//     } catch (error) {
//       next(error);
//     }
//   }
// };
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
      const updatedContact ={ name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        favorite:req.body.favorite}
      const contactId = req.params.id;
        const contact = await Contact.findByIdAndUpdate(contactId, updatedContact, {new:true});
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
// export const updateContact = async (req, res, next) => {
//   const body = req.body;
//   console.log(body);
//   const check = updateContactSchema.validate(body, { abortEarly: false });
//   const { error } = check;

//   if (error) {
//     res.status(400).json({ message: `${error.message}` });
//   }
//   if (Object.keys(body).length === 0) {
//     res.status(400).json({ message: "Body must have at least one field" });
//   } else {
//     try {
//       const contactId = req.params.id;
//       console.log(contactId);
//       const contact = await ChangeContact(contactId, body);
//       console.log(contact);
//       if (contact === null) {
//         res.status(404).json({ message: "Not found" });
//       } else {
//         res.status(200).json(contact);
//       }
//     } catch (error) {
//       next(error);
//     }
//   }
// };
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
        const contact = await Contact.findByIdAndUpdate(contactId, {favorite:req.body.favorite}, {new:true});
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