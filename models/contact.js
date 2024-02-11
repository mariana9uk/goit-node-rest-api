import mongoose from "mongoose";
export const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      // required:true
    },
  },
  { versionKey: false }
);
export const Contact = mongoose.model("Contact", contactSchema);
