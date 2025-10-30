import { getPool } from "./client";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: "parent" | "admin";
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  parent_user_id: string;
  child_name: string;
  child_age: number | null;
  child_preferences: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create a new user (sign-up)
 */
export async function createUser(data: {
  email: string;
  password_hash: string;
  full_name: string;
  role?: "parent" | "admin";
}): Promise<User> {
  const db = getPool();
  const result = await db.query(
    `INSERT INTO users (email, password_hash, full_name, role) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [data.email, data.password_hash, data.full_name, data.role || "parent"]
  );
  return result.rows[0];
}

/**
 * Get user by email (for sign-in)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const db = getPool();
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0] || null;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const db = getPool();
  const result = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
  return result.rows[0] || null;
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const db = getPool();
  await db.query(
    "UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1",
    [userId]
  );
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  data: {
    full_name?: string;
    email?: string;
    is_active?: boolean;
  }
): Promise<User | null> {
  const db = getPool();

  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.full_name !== undefined) {
    updates.push(`full_name = $${paramIndex}`);
    values.push(data.full_name);
    paramIndex++;
  }

  if (data.email !== undefined) {
    updates.push(`email = $${paramIndex}`);
    values.push(data.email);
    paramIndex++;
  }

  if (data.is_active !== undefined) {
    updates.push(`is_active = $${paramIndex}`);
    values.push(data.is_active);
    paramIndex++;
  }

  if (updates.length === 0) {
    return getUserById(userId);
  }

  updates.push(`updated_at = NOW()`);
  values.push(userId);

  const query = `
    UPDATE users 
    SET ${updates.join(", ")} 
    WHERE id = $${paramIndex} 
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0] || null;
}

/**
 * Create a child profile for a parent user
 */
export async function createUserProfile(data: {
  parent_user_id: string;
  child_name: string;
  child_age?: number;
  child_preferences?: Record<string, any>;
}): Promise<UserProfile> {
  const db = getPool();
  const result = await db.query(
    `INSERT INTO user_profiles (parent_user_id, child_name, child_age, child_preferences) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [
      data.parent_user_id,
      data.child_name,
      data.child_age || null,
      data.child_preferences ? JSON.stringify(data.child_preferences) : null,
    ]
  );
  return result.rows[0];
}

/**
 * Get all child profiles for a parent user
 */
export async function getUserProfiles(
  parentUserId: string
): Promise<UserProfile[]> {
  const db = getPool();
  const result = await db.query(
    "SELECT * FROM user_profiles WHERE parent_user_id = $1 ORDER BY created_at DESC",
    [parentUserId]
  );
  return result.rows;
}

/**
 * Update a child profile
 */
export async function updateUserProfile(
  profileId: string,
  data: {
    child_name?: string;
    child_age?: number;
    child_preferences?: Record<string, any>;
  }
): Promise<UserProfile | null> {
  const db = getPool();

  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.child_name !== undefined) {
    updates.push(`child_name = $${paramIndex}`);
    values.push(data.child_name);
    paramIndex++;
  }

  if (data.child_age !== undefined) {
    updates.push(`child_age = $${paramIndex}`);
    values.push(data.child_age);
    paramIndex++;
  }

  if (data.child_preferences !== undefined) {
    updates.push(`child_preferences = $${paramIndex}`);
    values.push(JSON.stringify(data.child_preferences));
    paramIndex++;
  }

  if (updates.length === 0) {
    const result = await db.query(
      "SELECT * FROM user_profiles WHERE id = $1",
      [profileId]
    );
    return result.rows[0] || null;
  }

  updates.push(`updated_at = NOW()`);
  values.push(profileId);

  const query = `
    UPDATE user_profiles 
    SET ${updates.join(", ")} 
    WHERE id = $${paramIndex} 
    RETURNING *
  `;

  const result = await db.query(query, values);
  return result.rows[0] || null;
}

/**
 * Delete a child profile
 */
export async function deleteUserProfile(profileId: string): Promise<boolean> {
  const db = getPool();
  const result = await db.query("DELETE FROM user_profiles WHERE id = $1", [
    profileId,
  ]);
  return result.rowCount ? result.rowCount > 0 : false;
}

/**
 * Check if email is already registered
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  const db = getPool();
  const result = await db.query(
    "SELECT COUNT(*) as count FROM users WHERE email = $1",
    [email]
  );
  return parseInt(result.rows[0].count) > 0;
}
