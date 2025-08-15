-- Migration script to update activities table to use proper foreign key relationships with users table
-- This script will:
-- 1. Add new columns for user ID relationships
-- 2. Populate the new columns based on existing username data
-- 3. Drop the old username column
-- 4. Add proper foreign key constraints

-- Step 1: Add new columns for user foreign keys
ALTER TABLE activities 
ADD COLUMN assigned_user_id BIGINT,
ADD COLUMN assigned_by_user_id BIGINT,
ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Task';

-- Step 2: Update assigned_user_id based on existing assigned_user username
UPDATE activities a 
SET assigned_user_id = (
    SELECT u.id 
    FROM users u 
    WHERE u.username = a.assigned_user
)
WHERE a.assigned_user IS NOT NULL;

-- Step 3: Update assigned_by_user_id if there's existing data (this might be NULL for existing records)
-- For now, we'll set all existing tasks as assigned by the manager user (id = 3)
UPDATE activities 
SET assigned_by_user_id = 3 
WHERE assigned_by_user_id IS NULL;

-- Step 4: Add NOT NULL constraint to assigned_user_id after data migration
ALTER TABLE activities 
MODIFY COLUMN assigned_user_id BIGINT NOT NULL;

-- Step 5: Add foreign key constraints
ALTER TABLE activities 
ADD CONSTRAINT fk_activity_assigned_user 
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_activity_assigned_by_user 
    FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 6: Drop the old assigned_user column
ALTER TABLE activities 
DROP COLUMN assigned_user;

-- Step 7: Add indexes for better performance
CREATE INDEX idx_activity_assigned_user_id ON activities(assigned_user_id);
CREATE INDEX idx_activity_assigned_by_user_id ON activities(assigned_by_user_id);
CREATE INDEX idx_activity_date_status ON activities(date, status);
CREATE INDEX idx_activity_status ON activities(status);
