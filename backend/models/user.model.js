import bcrypt from 'bcrypt';
import { pool } from '../config/postgres.js';

/**
 * User Model for PostgreSQL
 * Using raw SQL queries for direct control and performance
 */

class User {
  /**
   * Create a new user
   */
  static async create(email, hashedPassword, name = '') {
    try {
      const result = await pool.query(
        `INSERT INTO users (email, password, name) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, name, created_at`,
        [email, hashedPassword, name]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        // Unique violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        `SELECT id, email, password, name, created_at, updated_at 
         FROM users 
         WHERE email = $1`,
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(userId) {
    try {
      const result = await pool.query(
        `SELECT id, email, name, created_at, updated_at 
         FROM users 
         WHERE id = $1`,
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user
   */
  static async update(userId, updateData) {
    try {
      const allowedFields = ['email', 'password', 'name'];
      const updates = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }

      if (updates.length === 0) {
        return null;
      }

      values.push(userId);
      const query = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, email, name, created_at, updated_at`;

      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user
   */
  static async delete(userId) {
    try {
      const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id`, [
        userId,
      ]);
      return result.rowCount > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users (for admin purposes)
   */
  static async findAll(limit = 10, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT id, email, name, created_at, updated_at 
         FROM users 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Hash password
   */
  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password
   */
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

export default User;