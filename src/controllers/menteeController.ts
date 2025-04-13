import { Request, Response } from 'express';
import pool from '../db';
import { triggerNewMenteeWebhook } from '../services/n8nService';
import { PostgresError } from '../interfaces/PostgresError';

export const registerMentee = async (req: Request, res: Response): Promise<void> => {
  const { name, email, goals } = req.body;

  if (!name || !email) {
    res.status(400).json({
      success: false,
      error: 'Name and email are required'
    });
    return;
  }

  try {
    const query = `
      INSERT INTO mentees (name, email, goals)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [name, email, goals || null];
    const result = await pool.query(query, values);
    
    const newMentee = result.rows[0];

    // Trigger n8n webhook for new mentee
    await triggerNewMenteeWebhook(newMentee);

    res.status(201).json({
      success: true,
      mentee: newMentee
    });
  } catch (error: unknown) {
    console.error('Error registering mentee:', error);

    // Type checking for PostgreSQL error
    if (
      error && 
      typeof error === 'object' && 
      'code' in error && 
      'constraint' in error
    ) {
      const pgError = error as PostgresError;
      
      // Check for duplicate email
      if (pgError.code === '23505' && pgError.constraint === 'mentees_email_key') {
        res.status(409).json({
          success: false,
          error: 'A mentee with this email already exists'
        });
        return;
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getMenteeByEmail = async (req: Request, res: Response): Promise<void> => {
  const email = req.params.email;
  
  try {
    const query = 'SELECT * FROM mentees WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Mentee not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      mentee: result.rows[0]
    });
  } catch (error: unknown) {
    console.error('Error fetching mentee:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getAllMentees = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = 'SELECT * FROM mentees ORDER BY name ASC';
    const result = await pool.query(query);
    
    res.status(200).json({
      success: true,
      mentees: result.rows
    });
  } catch (error: unknown) {
    console.error('Error fetching mentees:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateMentee = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const { name, goals } = req.body;
  
  try {
    // Build query dynamically based on provided fields
    let query = 'UPDATE mentees SET ';
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (name) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }
    
    if (goals !== undefined) {
      updates.push(`goals = $${paramIndex}`);
      values.push(goals);
      paramIndex++;
    }
    
    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
      return;
    }
    
    query += updates.join(', ');
    query += ` WHERE id = $${paramIndex} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Mentee not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      mentee: result.rows[0]
    });
  } catch (error: unknown) {
    console.error('Error updating mentee:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};