<?php
require_once('02_transform.php');
require_once('../config.php');

$data = transformLuzernData();

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    $sql = "INSERT INTO entries (counter, name) VALUES (?, ?)";
    $stmt = $pdo->prepare($sql);

    foreach ($data as $row) {
        $stmt->execute([
            $row['counter'],
            $row['name']
        ]);
    }

    echo "Alle Daten erfolgreich eingefügt.";
} catch (PDOException $e) {
    error_log("Datenbankfehler: " . $e->getMessage());
    exit("Fehler beim Speichern.");
}
