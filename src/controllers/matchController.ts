import { Request, Response } from 'express';
import axios from 'axios';
import { triggerMatchingWebhook } from '../services/n8nService';

export const findMatches = async (req: Request, res: Response): Promise<void> => {
  const { name, email, goals } = req.body;

  if (!name || !email || !goals) {
    res.status(400).json({
      success: false,
      error: 'Name, email, and goals are required'
    });
    return;
  }

  try {
    // Use the n8n service to trigger the matching webhook
    const result = await triggerMatchingWebhook({
      name,
      email,
      goals
    });

    // Return the matches from n8n
    res.status(200).json({
      success: true,
      message: 'Matching process completed',
      matches: result.matches || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to find matching mentors'
    });
  }
};

export const createMenteeWithConnection = async (req: Request, res: Response): Promise<void> => {
  const { 
    mentee_name, 
    mentee_email, 
    mentee_goals, 
    selected_mentor_id 
  } = req.body;

  if (!mentee_name || !mentee_email || !selected_mentor_id) {
    res.status(400).json({
      success: false,
      error: 'Mentee details and selected mentor are required'
    });
    return;
  }

  try {
    // 1. Create the mentee
    const menteeResponse = await axios.post('http://localhost:3000/mentees/register', {
      name: mentee_name,
      email: mentee_email,
      goals: mentee_goals || ''
    });

    if (!menteeResponse.data.success) {
      throw new Error('Failed to create mentee');
    }

    const menteeId = menteeResponse.data.mentee.id;

    // 2. Create the connection
    const connectionResponse = await axios.post('http://localhost:3000/connections', {
      mentor_id: selected_mentor_id,
      mentee_id: menteeId
    });

    if (!connectionResponse.data.success) {
      throw new Error('Failed to create connection');
    }

    res.status(201).json({
      success: true,
      message: 'Mentee created and connected with mentor successfully',
      mentee: menteeResponse.data.mentee,
      connection: connectionResponse.data.connection
    });
  } catch (error) {
    console.error('Error creating mentee with connection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create mentee and connection'
    });
  }
};