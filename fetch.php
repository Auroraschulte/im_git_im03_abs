<?php
// Die URL der API
$url = 'https://portal.alfons.io/app/devicecounter/api/sensors?api_key=3ad08d9e67919877e4c9f364974ce07e36cbdc9e';

// Optionale Header (hier nicht notwendig, aber nützlich für andere APIs)
$options = [
    "http" => [
        "method" => "GET",
        "header" => "Content-Type: application/json"
    ]
];

// Erstellt einen Stream-Kontext
$context = stream_context_create($options);

// Verwendet file_get_contents mit dem erstellten Kontext, um die Daten abzurufen
$response = file_get_contents($url, false, $context);

// Überprüft, ob ein Fehler aufgetreten ist
if ($response === false) {
    echo "Ein Fehler ist aufgetreten.";
} else {
    //Hier können die Daten verarbeitet, oder in eine Datenbank geschrieben werden
}
?>