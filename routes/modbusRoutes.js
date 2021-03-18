const express = require('express');

const modbusController = require('../controllers/modbusController');

const router = express.Router();

router
  .route('/')
  .get(modbusController.getAllEntrys)
  .post(modbusController.createEntry); // only for testing and dev

router
  .route('/address/:reg/:adr')
  .get(modbusController.getEntryByAdr)
  .patch(modbusController.updateEntyByAdr);

router.route('/getUpdate').get(modbusController.getAllEntrysUpdatet);
router.route('/interval').get(modbusController.getAllEntrys);
router.route('/home').get(modbusController.getHomeEntrys);
router.route('/alarm').get(modbusController.getAllAlarm);

module.exports = router;
