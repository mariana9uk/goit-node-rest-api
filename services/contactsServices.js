import { readFile, writeFile } from "node:fs/promises";
import path, { dirname } from "node:path";
import crypto from "node:crypto";

const contactsPath = path.join(
  "..",
  "goit-node-rest-api",
  "db",
  "contacts.json"
);

export async function listContacts() {
  try {
    const data = await readFile(contactsPath, { encoding: "utf-8" });
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading contacts file:", error.message);
    throw error;
  }
}
export async function getContactById(contactId) {
  const contacts = await listContacts();
  console.log(contacts);
  const contact = contacts.find((contact) => contact.id === String(contactId));
  if (!contact) {
    return null;
  }
  return contact;
}

function writeContacts(contacts) {
  return writeFile(contactsPath, JSON.stringify(contacts, undefined, 2));
}

export async function removeContact(contactId) {
  const contacts = await listContacts();
  if (!contacts) {
    return;
  }
  const contactToDelete = contacts.find(
    (contact) => contact.id === String(contactId)
  );

  if (contactToDelete === undefined) {
    return null;
  }
  const newContactsList = contacts.filter(
    (contact) => contact.id !== String(contactId)
  );
  await writeContacts(newContactsList);
  return contactToDelete;
}
export async function addContact(newContactData) {
  const { email, phone, name } = newContactData;
  const newContact = { id: crypto.randomUUID(), name, email, phone };
  const contacts = await listContacts();
  contacts.push(newContact);
  await writeContacts(contacts);
  return newContact;
}
export async function updateContact(contactId) {
  const contacts = await listContacts();
  if (!contacts) {
    return;
  }
  const contactToUpdate = contacts.find(
    (contact) => contact.id === String(contactId)
  );

  if (contactToUpdate === undefined) {
    return null;
  }
  // const { email, phone, name } = newContactData;
  // const newContact = { id: crypto.randomUUID(), name, email, phone };

  // contacts.push(newContact);
  await writeContacts(contacts);
  return contactToUpdate
}

// export {
//   listContacts,
//   getContactById,
//   removeContact,
//   addContact,
// };
