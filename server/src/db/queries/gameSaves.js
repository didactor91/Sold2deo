/**
 * Game save queries — parameterized database operations for game saves
 * @module server/src/db/queries/gameSaves
 */
import { query } from '../db.js';

/**
 * Find game save by user ID
 * @param {number} userId
 * @returns {Promise<Object|null>}
 */
export async function findGameSaveByUserId(userId) {
  const result = await query(
    'SELECT id, user_id, save_data, created_at, updated_at FROM game_saves WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

/**
 * Create or update a game save (upsert)
 * @param {number} userId
 * @param {Object} saveData - Game state to save
 * @returns {Promise<Object>}
 */
export async function upsertGameSave(userId, saveData) {
  const result = await query(
    `INSERT INTO game_saves (user_id, save_data, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id)
     DO UPDATE SET save_data = $2, updated_at = CURRENT_TIMESTAMP
     RETURNING id, user_id, save_data, created_at, updated_at`,
    [userId, JSON.stringify(saveData)]
  );
  return result.rows[0];
}

/**
 * Delete a game save by user ID
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export async function deleteGameSave(userId) {
  const result = await query(
    'DELETE FROM game_saves WHERE user_id = $1',
    [userId]
  );
  return result.rowCount > 0;
}
