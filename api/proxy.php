<?php
header('Content-Type: application/json; charset=utf-8');

$config = include __DIR__ . '/config.php';
$url = $config['external_url'];
$opts = ['http' => ['timeout' => $config['timeout']]];
$context = stream_context_create($opts);
$response = @file_get_contents($url, false, $context);

if ($response === false) {
  http_response_code(500);
  echo json_encode(['error' => 'External API unreachable']);
  exit;
}

$data = json_decode($response, true);
if ($data === null) {
  http_response_code(500);
  echo json_encode(['error' => 'Invalid JSON from external API']);
  exit;
}

/**
 * Die Alfons-API liefert Sensorobjekte mit IDs, Namen, Counts, Zeitstempeln usw.
 * Wir wandeln sie in ein einheitliches, sauberes Format um.
 */
$output = [
  'fetched_at' => date('c'),
  'locations' => []
];

foreach ($data as $sensor) {
  $output['locations'][] = [
    'sensor_id'   => $sensor['id']        ?? null,
    'name'        => $sensor['name']      ?? null,
    'count'       => $sensor['count']     ?? null,
    'last_update' => $sensor['timestamp'] ?? null
  ];
}

echo json_encode($output, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
