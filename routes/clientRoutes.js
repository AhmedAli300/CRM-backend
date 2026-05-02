import express from 'express';
import {
  getClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  getClientStats,
  getClientChartStats,
  getTopClients,
  getTopFields,
  getFinancialStats,
  getMarketingCampaignStats,
  getClientTasks,
  addClientTask,
  addClientComplaint,
  getClientBehaviorStats,
  getClientComplaints,
  getMonthlyStats,
  getLast6MonthsStats
} from '../controllers/clientController.js';

const router = express.Router();

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', addClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

router.get('/stats/overview', getClientStats);
router.get('/stats/chart', getClientChartStats);
router.get('/stats/top-clients', getTopClients);
router.get('/stats/top-fields', getTopFields);
router.get('/stats/finance', getFinancialStats);
router.get('/stats/last6months', getLast6MonthsStats);
router.get('/stats/campaigns', getMarketingCampaignStats);
router.get('/stats/behavior', getClientBehaviorStats);
router.get('/stats/complaints', getClientComplaints);

router.get('/:id/tasks', getClientTasks);
router.post('/:id/tasks', addClientTask);
router.post('/:id/complaints', addClientComplaint);

router.get('/month/:month', getMonthlyStats);

export default router;
