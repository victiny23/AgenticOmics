-- Reset database to fix WITHDRAWN status constraint issue
-- This will drop and recreate the tables with correct constraints

-- Drop existing tables
DROP TABLE IF EXISTS team_membership_requests;
DROP TABLE IF EXISTS lab_membership_requests;

-- Recreate team_membership_requests table with WITHDRAWN status
CREATE TABLE team_membership_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    requested_role VARCHAR(255),
    request_message TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN')),
    reviewed_by BIGINT,
    review_message TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES team_info(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Recreate lab_membership_requests table with WITHDRAWN status
CREATE TABLE lab_membership_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lab_id BIGINT NOT NULL,
    requested_role VARCHAR(255),
    request_message TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN')),
    reviewed_by BIGINT,
    review_message TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lab_id) REFERENCES lab_info(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

SELECT 'Database tables recreated with WITHDRAWN status support' as message;
