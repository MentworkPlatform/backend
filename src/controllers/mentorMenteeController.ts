import { Request, Response } from 'express';
import pool from '../db';
import { triggerNewConnectionWebhook } from '../services/n8nService';

export const createConnection = async (req: Request, res: Response): Promise<void> => {
  const { mentor_id, mentee_id } = req.body;

  if (!mentor_id || !mentee_id) {
    res.status(400).json({
      success: false,
      error: 'Mentor ID and Mentee ID are required'
    });
    return;
  }

  try {
    // Check if mentor exists
    const mentorQuery = 'SELECT id, name, email FROM mentors WHERE id = $1';
    const mentorResult = await pool.query(mentorQuery, [mentor_id]);
    
    if (mentorResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Mentor not found'
      });
      return;
    }

    // Check if mentee exists
    const menteeQuery = 'SELECT id, name, email FROM mentees WHERE id = $1';
    const menteeResult = await pool.query(menteeQuery, [mentee_id]);
    
    if (menteeResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Mentee not found'
      });
      return;
    }

    // Check if connection already exists
    const existingQuery = `
      SELECT id FROM mentor_mentee_connections 
      WHERE mentor_id = $1 AND mentee_id = $2
    `;
    const existingResult = await pool.query(existingQuery, [mentor_id, mentee_id]);
    
    if (existingResult.rows.length > 0) {
      res.status(409).json({
        success: false,
        error: 'Connection already exists',
        connection_id: existingResult.rows[0].id
      });
      return;
    }

    const query = `
      INSERT INTO mentor_mentee_connections (mentor_id, mentee_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    
    const result = await pool.query(query, [mentor_id, mentee_id]);
    
    const newConnection = result.rows[0];

    // Trigger n8n webhook for new connection
    const webhookResult = await triggerNewConnectionWebhook(mentee_id, mentor_id);
    
    // Check if there was an error with the webhook
    if (webhookResult && webhookResult.error) {
      console.warn('Webhook warning:', webhookResult.error);
      // Continue anyway since the DB operation succeeded
    }

    res.status(201).json({
      success: true,
      connection: newConnection
    });
  } catch (error: unknown) {
    console.error('Error creating connection:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getConnectionsByMentor = async (req: Request, res: Response): Promise<void> => {
  const mentorId = req.params.mentorId;

  try {
    const query = `
      SELECT c.*, m.name as mentee_name, m.email as mentee_email, m.goals as mentee_goals
      FROM mentor_mentee_connections c
      JOIN mentees m ON c.mentee_id = m.id
      WHERE c.mentor_id = $1
      ORDER BY c.created_at DESC;
    `;
    
    const result = await pool.query(query, [mentorId]);

    res.status(200).json({
      success: true,
      connections: result.rows
    });
  } catch (error: unknown) {
    console.error('Error fetching mentor connections:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getConnectionsByMentee = async (req: Request, res: Response): Promise<void> => {
  const menteeId = req.params.menteeId;

  try {
    const query = `
      SELECT c.*, m.name as mentor_name, m.email as mentor_email, 
             m.expertise, m.experience_years, m.profile_picture_url
      FROM mentor_mentee_connections c
      JOIN mentors m ON c.mentor_id = m.id
      WHERE c.mentee_id = $1
      ORDER BY c.created_at DESC;
    `;
    
    const result = await pool.query(query, [menteeId]);

    res.status(200).json({
      success: true,
      connections: result.rows
    });
  } catch (error: unknown) {
    console.error('Error fetching mentee connections:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteConnection = async (req: Request, res: Response): Promise<void> => {
  const connectionId = req.params.id;
  
  try {
    const query = 'DELETE FROM mentor_mentee_connections WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [connectionId]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Connection not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Connection deleted successfully',
      connection: result.rows[0]
    });
  } catch (error: unknown) {
    console.error('Error deleting connection:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};