<?php
/**
 * ==========================================================================
 * TaskSphere - Database Connection & Initialization Module (database.php)
 * ==========================================================================
 */

try {
    // Database connection using PDO (PHP Data Objects)
    // Connects to a local SQLite database file database.sqlite.
    // Can be easily switched to MySQL by changing the DSN string:
    // $db = new PDO('mysql:host=localhost;dbname=tasksphere', 'username', 'password');
    $db = new PDO('sqlite:database.sqlite');
    
    // Enable exceptions on error
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Fetch results as associative arrays
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Initialize Database Table if it does not exist
    $db->exec("CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        category TEXT DEFAULT 'General',
        dueDate TEXT,
        completed INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
    )");

} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}
?>
