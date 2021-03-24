const express = require('express');

const modbusController = require('../controllers/modbusController');

const router = express.Router();

router.route('/').get(modbusController.getAllEntrys);

router
  .route('/:id')
  .get(modbusController.getEntryByID)
  .patch(modbusController.updateEntryByID);

router.route('/getUpdate').get(modbusController.getAllEntrysUpdatet);
router.route('/interval').get(modbusController.updateInterval);
router.route('/home').get(modbusController.getHomeEntrys);
router.route('/alarm').get(modbusController.getAllAlarm);

module.exports = router;
