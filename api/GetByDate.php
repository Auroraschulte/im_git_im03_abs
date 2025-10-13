<?php

require_once '../config.php'; //datenbank Zugangsdaten einbingen

// json aktivieren (Wir möchten datei sagen, dass sie json zurückgeben soll)
header('Content-Type: application/json');

try{
 
    $pdo = new PDO ($dsn, $username, $password, $options);

    $date = $_GET['date']; //kann auf infos zugreifen die in meiner URL drinn sind (möglich durch Datepicker (html))

    $sql = "SELECT * FROM RainyParking WHERE DATE(timestamp) = :date"; //timestamp ist der name der Spalte (individuell anpassen, ist beispiel von lea), :date ist ein php platzhalter definiert durch die individuell definierte Variable
    $stmt = $pdo->prepare($sql);
    $stmt->execute([ 'date' => $date ]); //hier sagen wir, dass beim platzhalter Today die variable date eingefügt werden soll (Diese besagt durch den GET, dass immer das Datum gemeint ist, welches in der URL mitgeliefert wird durch en Daypicker im HTML)
    $result = $stmt->fetchall();
    echo json_encode($results);
} 
catch (PDOException $e) {
  die"Verbindung zur Datenbank konnte nicht hergestellt werden: ". SE->getMe
}