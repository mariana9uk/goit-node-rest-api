// import contactsService from "../services/contactsServices.js"

import { getContactById, listContacts } from "../services/contactsServices.js";


export const getAllContacts = async (req, res) => {
    try {
       const contacts = await listContacts()
       res.status(200).json(contacts)
    } catch (error) {
        
    }};

export const getOneContact = async (req, res, ) => {
    try {
        const contact = await getContactById()
        if (contact===null) {
            res.status(404).json({"message": "Not found"})
        } 
        res.status(201).json(contact)
        
     } catch (error) {
         
     }
};

export const deleteContact = (req, res) => {};

export const createContact = (req, res) => {};

export const updateContact = (req, res) => {};
