import { Router } from 'express';
import mentorRoutes from './mentors';
import menteeRoutes from './mentees';
import programRoutes from './programs';
import connectionRoutes from './mentorMenteeconnections';
import matchingRoutes from './matching';

const router = Router();

// Use specific routes
router.use('/mentors', mentorRoutes);
router.use('/mentees', menteeRoutes);
router.use('/programs', programRoutes);
router.use('/connections', connectionRoutes);
router.use('/matching', matchingRoutes);

export default router;