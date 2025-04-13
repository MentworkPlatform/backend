import { Router } from 'express';
import { 
  registerMentee, 
  getMenteeByEmail, 
  getAllMentees, 
  updateMentee 
} from '../controllers/menteeController';

const router = Router();

// Mentee routes
router.post('/register', registerMentee);
router.get('/email/:email', getMenteeByEmail);
router.get('/', getAllMentees);
router.put('/:id', updateMentee);

export default router;