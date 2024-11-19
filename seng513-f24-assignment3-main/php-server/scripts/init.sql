-- Create users table with is_admin column
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- Insert default admin user with hashed password
INSERT INTO users (username, password, is_admin) 
VALUES ('admin', SHA2('password', 256), TRUE) 
ON DUPLICATE KEY UPDATE username = 'admin';