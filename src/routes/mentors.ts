import { Router } from 'express';
import { 
  registerMentor, 
  getMentorByEmail, 
  getAllMentors, 
  updateMentor, 
  getMentorById
} from '../controllers/mentorController';

const router = Router();

// Mentor routes
router.post('/register', registerMentor);
router.get('/email/:email', getMentorByEmail);
router.get('/id/:id', getMentorById);
router.get('/', getAllMentors);
router.put('/:id', updateMentor);

export default router;