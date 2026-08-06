import express from 'express';
import {
  getNurses,
  getRooms,
  getPatients,
  getMedications,
  getRoomLogs,
  searchPatients,
  updateMedicationStatus,
  updatePatientRoom,
  dischargePatient,
  addMedicationRecord,
  updatePatientMemoPartial,
  deleteMedication,
  resetData
} from '../controllers/mainController.js';

const router = express.Router();

router.get('/nurses', getNurses);
router.get('/rooms', getRooms);
router.get('/patients', getPatients);
router.get('/medications', getMedications);
router.get('/room-logs', getRoomLogs);
router.get('/patients/search', searchPatients);

router.patch('/medications/:id/status', updateMedicationStatus);
router.patch('/patients/:id/room', updatePatientRoom);
router.post('/patients/:id/discharge', dischargePatient);
router.post('/medications', addMedicationRecord);
router.patch('/patients/:id/memo', updatePatientMemoPartial);
router.delete('/medications/:id', deleteMedication);

router.post('/reset', resetData);

export default router;
