import mongoose, { Schema, Document } from "mongoose";

// Define the Guest Session Interface
export interface GuestSession extends Document {
  guestId: string;
  createdAt: Date;
  lastAccessed: Date;
}

// Define the Session Schema
const GuestSessionSchema: Schema = new Schema({
  guestId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastAccessed: { type: Date, default: Date.now },
});

// Update `lastAccessed` every time a session is used
GuestSessionSchema.pre("save", function (next) {
  this.lastAccessed = new Date();
  next();
});

// Create the Session Model
const GuestSessionModel = mongoose.model<GuestSession>(
  "GuestSession",
  GuestSessionSchema
);

export default GuestSessionModel;
