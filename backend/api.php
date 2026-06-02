<?php
/**
 * ==========================================================================
 * TaskSphere - RESTful API Native PHP Controller (api.php)
 * ==========================================================================
 */

require_once 'database.php';

// Set response and CORS headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        try {
            $stmt = $db->query("SELECT * FROM tasks ORDER BY createdAt DESC");
            $rows = $stmt->fetchAll();
            
            // Map integer (0/1) back to boolean (false/true) for frontend integration
            $tasks = array_map(function($task) {
                $task['completed'] = (bool)$task['completed'];
                return $task;
            }, $rows);
            
            echo json_encode($tasks);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'POST':
        // Read JSON input body
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || empty($data['title'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Title is required']);
            break;
        }

        // Assign default values if not provided
        $taskId = $data['id'] ?? 'task_' . time() . '_' . uniqid();
        $createdAt = $data['createdAt'] ?? date(DATE_ISO8601);
        $completed = !empty($data['completed']) ? 1 : 0;

        try {
            $stmt = $db->prepare("INSERT INTO tasks (id, title, description, priority, category, dueDate, completed, createdAt) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $taskId,
                trim($data['title']),
                $data['description'] ?? '',
                $data['priority'] ?? 'medium',
                $data['category'] ?? 'General',
                $data['dueDate'] ?? '',
                $completed,
                $createdAt
            ]);

            // Fetch the newly created record to return
            $stmt = $db->prepare("SELECT * FROM tasks WHERE id = ?");
            $stmt->execute([$taskId]);
            $created = $stmt->fetch();
            $created['completed'] = (bool)$created['completed'];

            http_response_code(201);
            echo json_encode($created);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Task ID is required in URL parameters']);
            break;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(['error' => 'No updates provided']);
            break;
        }

        try {
            // Check if the record exists
            $stmt = $db->prepare("SELECT * FROM tasks WHERE id = ?");
            $stmt->execute([$id]);
            $existing = $stmt->fetch();
            if (!$existing) {
                http_response_code(404);
                echo json_encode(['error' => 'Task not found']);
                break;
            }

            // Dynamically construct update query based on fields received
            $fields = [];
            $params = [];
            
            $validKeys = ['title', 'description', 'priority', 'category', 'dueDate', 'completed'];
            foreach ($data as $key => $value) {
                if (in_array($key, $validKeys)) {
                    $fields[] = "$key = ?";
                    if ($key === 'completed') {
                        $params[] = $value ? 1 : 0;
                    } else {
                        $params[] = $value;
                    }
                }
            }

            if (empty($fields)) {
                http_response_code(400);
                echo json_encode(['error' => 'No valid updates provided']);
                break;
            }

            $params[] = $id;
            $stmt = $db->prepare("UPDATE tasks SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($params);

            // Fetch the updated task record
            $stmt = $db->prepare("SELECT * FROM tasks WHERE id = ?");
            $stmt->execute([$id]);
            $updated = $stmt->fetch();
            $updated['completed'] = (bool)$updated['completed'];

            echo json_encode($updated);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Task ID is required in URL parameters']);
            break;
        }

        try {
            // Fetch task details to return in the delete response (needed for frontend Undo toast)
            $stmt = $db->prepare("SELECT * FROM tasks WHERE id = ?");
            $stmt->execute([$id]);
            $task = $stmt->fetch();
            
            if (!$task) {
                http_response_code(404);
                echo json_encode(['error' => 'Task not found']);
                break;
            }

            // Perform deletion
            $stmt = $db->prepare("DELETE FROM tasks WHERE id = ?");
            $stmt->execute([$id]);

            $task['completed'] = (bool)$task['completed'];
            echo json_encode([
                'message' => 'Task deleted successfully',
                'deletedTask' => $task
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
        break;
}
?>
