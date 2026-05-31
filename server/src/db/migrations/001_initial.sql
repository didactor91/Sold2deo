-- Initial PostgreSQL schema for Weld Master
-- Migration: 001_initial.sql

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game saves table for persisting player progress
CREATE TABLE IF NOT EXISTS game_saves (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    save_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Index for faster user lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Index for faster save lookup by user
CREATE INDEX IF NOT EXISTS idx_game_saves_user_id ON game_saves(user_id);
