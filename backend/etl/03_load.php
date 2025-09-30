<?php

$data = include('02_transform.php');

require_once '../config.php';

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $sql = "INSERT INTO entries (counter, name) VALUES (?, ?)";
    $stmt = $pdo->prepare($sql);

     $stmt->execute([
        $data['counter'],
        $data['name']    
    ]);

    echo "Daten erfolgreich eingefügt.";
} catch (PDOException $e) {
    die("Verbindung zur Datenbank konnte nicht hergestellt werden: " . $e->getMessage());
}

