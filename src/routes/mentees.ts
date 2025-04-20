import { Router } from 'express';
import { 
  registerMentee, 
  getMenteeByEmail, 
  getAllMentees, 
  updateMentee,
  getMenteeById
} from '../controllers/menteeController';

const router = Router();

// Mentee routes
router.post('/register', registerMentee);
router.get('/email/:email', getMenteeByEmail);
router.get('/id/:id', getMenteeById);
router.get('/', getAllMentees);
router.put('/:id', updateMentee);

export default router