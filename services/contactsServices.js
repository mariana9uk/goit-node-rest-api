import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const contactsPath = path.join(__dirname, '..', 'db', 'contacts.json');
const contactsService = {
   async listContacts() {
  try {
    const data = await readFile(contactsPath, { encoding: 'utf-8' });
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading contacts file:', error.message);
    throw error;
  }
},
 async getContactById(contactId) {
  const contacts = await listContacts();
  const contact = contacts.find((contact) => contact.id === String(contactId));

  if (!contact) {
    return null;
  }

  return contact;
}
,
 writeContacts(contacts) {
  return writeFile(contactsPath, JSON.stringify(contacts, undefined, 2));
}
,
 async removeContact(contactId) {
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
,

 async addContact(name, email, phone) {
  const newContact = { name, email, phone, id: crypto.randomUUID() };
  const contacts = await listContacts();

  contacts.push(newContact);
  await writeContacts(contacts);

  return newContact;
}
}
export default contactsService ;
// export {
//   listContacts,
//   getContactById,
//   removeContact,
//   addContact,
// };
