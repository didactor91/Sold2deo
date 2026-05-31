/**
 * User queries — parameterized database operations for users
 * @module server/src/db/queries/users
 */
import { query } from '../db.js';

/**
 * Find a user by username
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
export async function findUserByUsername(username) {
  const result = await query(
    'SELECT id, username, password_hash FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0] || null;
}

/**
 * Find a user by ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function findUserById(id) {
  const result = await query(
    'SELECT id, username, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Create a new user
 * @param {string} username
 * @param {string} passwordHash - Already hashed password
 * @returns {Promise<Object>}
 */
export async function createUser(username, passwordHash) {
  const result = await query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
    [username, passwordHash]
  );
  return result.rows[0];
}

/**
 * Check if username exists
 * @param {string} username
 * @returns {Promise<boolean>}
 */
export async function usernameExists(username) {
  const result = await query(
    'SELECT 1 FROM users WHERE username = $1',
    [username]
  );
  return result.rows.length > 0;
}
