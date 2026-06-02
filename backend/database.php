<?php
/**
 * ==========================================================================
 * TaskSphere - Database Connection & Initialization Module (database.php)
 * ==========================================================================
 */

try {
    $host = '127.0.0.1';
    $dbname = 'tasksphere';
    $username = 'root';
    $password = ''; // Default XAMPP/MariaDB password is empty

    // 1. Connect to MySQL server first (without specifying dbname to allow auto-creation)
    $db = new PDO("mysql:host=$host", $username, $password);
    
    // Enable exceptions on error
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Fetch results as associative arrays
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // 2. Create the database if it does not exist
    $db->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    // 3. Select/use the database
    $db->exec("USE `$dbname`");

    // 4. Initialize Database Table if it does not exist
    // MySQL requires primary keys like VARCHAR to have a defined length, unlike SQLite's TEXT PRIMARY KEY
    $db->exec("CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(20) DEFAULT 'medium',
        category VARCHAR(100) DEFAULT 'General',
        dueDate VARCHAR(50),
        completed INT DEFAULT 0,
        createdAt VARCHAR(50) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}
?>
