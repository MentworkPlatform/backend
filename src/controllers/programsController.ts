import { Request, Response } from 'express';
import pool from '../db';
import { triggerNewProgramWebhook } from '../services/n8nService';


export const createProgram = async (req: Request, res: Response): Promise<void> => {
  const { 
    mentor_email,
    title,
    description,
    session_type,
    price,
    duration,
    session_date
  } = req.body;

  if (!mentor_email || !title || !session_date) {
    res.status(400).json({
      success: false,
      error: 'Mentor email, title, and session date are required'
    });
    return;
  }

  try {
    // First check if the mentor exists
    const mentorCheckQuery = 'SELECT id FROM mentors WHERE email = $1';
    const mentorCheckResult = await pool.query(mentorCheckQuery, [mentor_email]);
    
    if (mentorCheckResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Mentor not found'
      });
      return;
    }

    const query = `
      INSERT INTO programs (
        mentor_email,
        title,
        description,
        session_type,
        price,
        duration,
        session_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    
    const values = [
      mentor_email,
      title,
      description || null,
      session_type || null,
      price || null,
      duration || null,
      session_date
    ];
    
    const result = await pool.query(query, values);
    
    const newProgram = result.rows[0];
    
    // Get mentor details to include in the webhook
    const mentorDetailQuery = 'SELECT name FROM mentors WHERE email = $1';
    const mentorDetailResult = await pool.query(mentorDetailQuery, [mentor_email]);
    const mentorName = mentorDetailResult.rows[0]?.name || '';
    
    // Trigger n8n webhook for new program
    await triggerNewProgramWebhook({
      ...newProgram,
      mentor_name: mentorName
    });

    res.status(201).json({
      success: true,
      program: newProgram
    });
  } catch (error: unknown) {
    console.error('Error creating program:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getProgramsByMentorEmail = async (req: Request, res: Response): Promise<void> => {
  const mentorEmail = req.params.email;

  try {
    const query = `
      SELECT * FROM programs 
      WHERE mentor_email = $1
      ORDER BY session_date DESC;
    `;
    
    const result = await pool.query(query, [mentorEmail]);

    res.status(200).json({
      success: true,
      programs: result.rows
    });
  } catch (error: unknown) {
    console.error('Error fetching mentor programs:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getAllPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT p.*, m.name as mentor_name
      FROM programs p
      JOIN mentors m ON p.mentor_email = m.email
      ORDER BY p.session_date DESC;
    `;
    
    const result = await pool.query(query);

    res.status(200).json({
      success: true,
      programs: result.rows
    });
  } catch (error: unknown) {
    console.error('Error fetching all programs:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateProgram = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const { 
    title,
    description,
    session_type,
    price,
    duration,
    session_date
  } = req.body;
  
  try {
    // Build query dynamically based on provided fields
    let query = 'UPDATE programs SET ';
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (title) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }
    
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }
    
    if (session_type !== undefined) {
      updates.push(`session_type = $${paramIndex}`);
      values.push(session_type);
      paramIndex++;
    }
    
    if (price !== undefined) {
      updates.push(`price = $${paramIndex}`);
      values.push(price);
      paramIndex++;
    }
    
    if (duration !== undefined) {
      updates.push(`duration = $${paramIndex}`);
      values.push(duration);
      paramIndex++;
    }
    
    if (session_date) {
      updates.push(`session_date = $${paramIndex}`);
      values.push(session_date);
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
        error: 'Program not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      program: result.rows[0]
    });
  } catch (error: unknown) {
    console.error('Error updating program:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const deleteProgram = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  
  try {
    const query = 'DELETE FROM programs WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Program not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Program deleted successfully',
      program: result.rows[0]
    });
  } catch (error: unknown) {
    console.error('Error deleting program:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};