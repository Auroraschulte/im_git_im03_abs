<?php
header('Content-Type: application/json');
require 'db.php';

$stmt = $pdo->query("SELECT name, visitors, date FROM locations ORDER BY date ASC");
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
