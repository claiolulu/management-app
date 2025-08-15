-- Migration script to create the activities table
-- This script will:
-- 1. Create the activities table with necessary columns
-- 2. Add primary key and indexes

-- Step 1: Create the activities table
CREATE TABLE activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    assigned_user_id BIGINT,
    assigned_by_user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 2: Add foreign key constraints
ALTER TABLE activities 
ADD CONSTRAINT fk_activity_assigned_user 
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_activity_assigned_by_user 
    FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Step 3: Add indexes for better performance
CREATE INDEX idx_activity_assigned_user_id ON activities(assigned_user_id);
CREATE INDEX idx_activity_assigned_by_user_id ON activities(assigned_by_user_id);
CREATE INDEX idx_activity_date_status ON activities(date, status);
CREATE INDEX idx_activity_status ON activities(status);
