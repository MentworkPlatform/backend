import { Request, Response } from 'express';
import axios from 'axios';
import { triggerMatchingWebhook, triggerNewConnectionWebhook } from '../services/n8nService';

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
    try {
      const checkResponse = await axios.get(`http://localhost:3050/mentees/email/${email}`);
      if (checkResponse.data.success) {
        res.status(409).json({
          success: false,
          error: 'A mentee with this email already exists'
        });
        return;
      }
    } catch (checkError: any) {
      if (checkError.response && checkError.response.status !== 404) {
        throw checkError;
      }
    }

    const result = await triggerMatchingWebhook({
      name,
      email,
      goals
    });

    if (result.error) {
      res.status(result.status || 400).json({
        success: false,
        error: result.error
      });
      return;
    }

    if (!result.matches || result.matches.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No matching mentors found',
        matches: []
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Matching process completed',
      matches: result.matches || []
    });
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.error || '';
      
      if (errorMessage.includes('duplicate key') || 
          errorMessage.includes('already exists')) {
        res.status(409).json({
          success: false,
          error: 'A mentee with this email already exists'
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to find matching mentors'
    });
  }
};

export const createConnection = async (req: Request, res: Response): Promise<void> => {
  let mentee_id, selected_mentor_id;
  
  if (Array.isArray(req.body)) {
    if (req.body[0]) {
      mentee_id = req.body[0].mentee_id;
      selected_mentor_id = req.body[0].selected_mentor_id;
    }
  } else {
    mentee_id = req.body.mentee_id;
    selected_mentor_id = req.body.selected_mentor_id;
  }
  
  console.log("Extracted IDs:", mentee_id, selected_mentor_id);
  console.log("Original body:", req.body);

  if (!mentee_id || !selected_mentor_id) {
    res.status(400).json({
      success: false,
      error: 'Mentee and selected mentor are required'
    });
    return;
  }

  try {
    const connectionResult = await triggerNewConnectionWebhook(mentee_id, selected_mentor_id);

    if (connectionResult.error) {
      res.status(connectionResult.status || 400).json({
        success: false,
        error: connectionResult.error
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Mentee connected with mentor successfully',
      connection: connectionResult.connection || connectionResult
    });
  } catch (error) {
    console.error('Error in createConnection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create connection'
    });
  }
};