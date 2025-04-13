import { Router } from 'express';
import { 
  createProgram, 
  getProgramsByMentorEmail, 
  getAllPrograms,
  updateProgram,
  deleteProgram
} from '../controllers/programsController';

const router = Router();

// Program routes
router.post('/', createProgram);
router.get('/mentor/:email', getProgramsByMentorEmail);
router.get('/', getAllPrograms);
router.put('/:id', updateProgram);
router.delete('/:id', deleteProgram);

export default router;