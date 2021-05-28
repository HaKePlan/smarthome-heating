const express = require('express');

const authController = require('../controllers/authController');
const modbusController = require('../controllers/modbusController');

const router = express.Router();

router.route('/').get(modbusController.getAllEntrys);

router
  .route('/id/:id')
  .get(modbusController.getEntryByID)
  .patch(authController.protect, modbusController.updateEntryByID);

router.route('/domain/:domain').get(modbusController.getDomainEntrys);
router.route('/getUpdate').get(modbusController.getAllEntrysUpdatet);
router.route('/interval').get(modbusController.updateInterval);
router.route('/home').get(modbusController.getHomeEntrys);
router.route('/alarm').get(modbusController.getAllActiveAlarm);

module.exports = router;
