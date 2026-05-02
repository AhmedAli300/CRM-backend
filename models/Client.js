// server/models/Client.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    dueDate: { type: Date },
    note: { type: String },
    completed: { type: Boolean, default: false }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    company: { type: String },
    field: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    subscriptions: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    transactions: [transactionSchema],
    lastActivity: { type: Date },
    notes: { type: String },
    campaignSource: { type: String },
    engagementLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    tasks: [taskSchema],
    complaints: [complaintSchema]
  },
  { timestamps: true }
);

const Client = mongoose.model('Client', clientSchema);
export default Client;
