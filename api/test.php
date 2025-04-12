<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'message' => 'API is working',
    'time' => date('Y-m-d H:i:s')
]); 