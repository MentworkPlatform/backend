import { Request, Response } from 'express';
import pool from '../db';
import { triggerNewMentorWebhook } from '../services/n8nService';
import { PostgresError } from '../interfaces/PostgresError';

export const registerMentor = async (req: Request, res: Response): Promise<void> => {
  const { 
    name, 
    email, 
    bio, 
    expertise, 
    experience_years, 
    profile_picture_url 
  } = req.body;

  if (!name || !email) {
    res.status(400).json({ 
      success: false,
      error: 'Name and email are required' 
    });
    return;
  }

  try {
    const query = `
      INSERT INTO mentors (
        name, 
        email, 
        bio, 
        expertise, 
        experience_years, 
        profile_picture_url
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      name, 
      email, 
      bio || null, 
      expertise || null, 
      experience_years || null, 
      profile_picture_url || null
    ];

    const result = await pool.query(query, values);

    const newMentor = result.rows[0];

    // Trigger n8n webhook for new mentor
    await triggerNewMentorWebhook(newMentor);

    res.status(201).json({ 
      success: true,
      mentor: newMentor 
    });
  } catch (error: unknown) {
    console.error('Error registering mentor:', error);

    if (
      error && 
      typeof error === 'object' && 
      'code' in error && 
      'constraint' in error
    ) {
      const pgError = error as PostgresError;

      // Check for duplicate email
      if (pgError.code === '23505' && pgError.constraint === 'mentors_email_key') {
        res.status(409).json({ 
          success: false,
          error: 'A mentor with this email already exists' 
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

export const getMentorByEmail = async (req: Request, res: Response): Promise<void> => {
  const email = req.params.email;
  
  try {
    const query = 'SELECT * FROM mentors WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      res.status(404).json({ 
        success: false,
        error: 'Mentor not found' 
      });
      return;
    }

    res.status(200).json({ 
      success: true,
      mentor: result.rows[0] 
    });
  } catch (error: unknown) {
    console.error('Error fetching mentor:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

export const getMentorById = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  try {
    const query = 'SELECT * FROM mentors WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ 
        success: false,
        error: 'Mentor not found' 
      });
      return;
    }

    res.status(200).json({ 
      success: true,
      mentor: result.rows[0] 
    });

  } catch (error: unknown) {
    console.error('Error fetching mentor by ID:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

export const getAllMentors = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = 'SELECT * FROM mentors ORDER BY name ASC';
    const result = await pool.query(query);

    res.status(200).json({ 
      success: true,
      mentors: result.rows 
    });
  } catch (error: unknown) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

export const updateMentor = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const { 
    name, 
    bio, 
    expertise, 
    experience_years, 
    profile_picture_url 
  } = req.body;
  
  try {
    // Build query dynamically based on provided fields
    let query = 'UPDATE mentors SET ';
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex}`);
      values.push(bio);
      paramIndex++;
    }

    if (expertise !== undefined) {
      updates.push(`expertise = $${paramIndex}`);
      values.push(expertise);
      paramIndex++;
    }

    if (experience_years !== undefined) {
      updates.push(`experience_years = $${paramIndex}`);
      values.push(experience_years);
      paramIndex++;
    }

    if (profile_picture_url !== undefined) {
      updates.push(`profile_picture_url = $${paramIndex}`);
      values.push(profile_picture_url);
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
        error: 'Mentor not found' 
      });
      return;
    }

    res.status(200).json({ 
      success: true,
      mentor: result.rows[0] 
    });
  } catch (error: unknown) {
    console.error('Error updating mentor:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};