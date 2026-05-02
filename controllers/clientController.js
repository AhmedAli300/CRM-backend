import Client from '../models/Client.js';

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addClient = async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClientStats = async (req, res) => {
  try {
    const total = await Client.countDocuments();
    const active = await Client.countDocuments({ status: 'Active' });
    const inactive = await Client.countDocuments({ status: 'Inactive' });
    res.json({ total, active, inactive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClientChartStats = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);
    const labels = stats.map(s => `شهر ${s._id}`);
    const data = stats.map(s => s.count);
    res.json({ labels, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTopClients = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const topClients = await Client.find().sort({ totalSpent: -1 }).limit(limit);
    res.json(topClients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTopFields = async (req, res) => {
  try {
    const fields = await Client.aggregate([
      { $group: { _id: '$field', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { field: '$_id', count: 1, _id: 0 } }
    ]);
    res.json(fields);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFinancialStats = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalSpent' }, avgRevenue: { $avg: '$totalSpent' } } }
    ]);
    const { totalRevenue = 0, avgRevenue = 0 } = stats[0] || {};
    res.json({ totalRevenue, avgRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLast6MonthsStats = async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const stats = await Client.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    const labels = stats.map(s => `شهر ${s._id.month}`);
    const data = stats.map(s => s.count);

    res.json({ labels, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMarketingCampaignStats = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      { $group: { _id: '$campaignSource', clients: { $sum: 1 }, totalSpent: { $sum: '$totalSpent' } } },
      { $project: { campaign: '$_id', clients: 1, totalSpent: 1, _id: 0 } },
      { $sort: { clients: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClientTasks = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select('tasks');
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client.tasks || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addClientTask = async (req, res) => {
  try {
    const { title, dueDate, note } = req.body;
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    client.tasks.push({ title, dueDate, note, completed: false });
    await client.save();
    res.status(201).json(client.tasks);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const addClientComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    client.complaints.push({ title, description, createdAt: new Date() });
    await client.save();
    res.status(201).json(client.complaints);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getClientComplaints = async (req, res) => {
  try {
    const data = await Client.aggregate([
      { $unwind: { path: '$complaints', preserveNullAndEmptyArrays: true } },
      { $match: { 'complaints.title': { $exists: true } } },
      { $project: { client: '$name', message: '$complaints.description', title: '$complaints.title', _id: 0 } },
      { $sort: { client: 1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClientBehaviorStats = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      { $group: { _id: '$engagementLevel', avgSpent: { $avg: '$totalSpent' }, clients: { $sum: 1 } } },
      { $project: { engagementLevel: '$_id', avgSpent: 1, clients: 1, _id: 0 } },
      { $sort: { avgSpent: -1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMonthlyStats = async (req, res) => {
  try {
    const month = parseInt(req.params.month, 10);
    const year = new Date().getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const clients = await Client.find({ createdAt: { $gte: start, $lte: end } });

    const newClients = clients.length;
    const revenue = clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const active = clients.filter(c => c.status === 'Active').length;
    const inactive = clients.filter(c => c.status === 'Inactive').length;

    res.json({ newClients, revenue, active, inactive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
