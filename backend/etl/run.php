<?php
chdir(__DIR__);
$config = include 'config.php';
require '01_extract.php';
require '02_transform.php';
require '03_load.php';

try {
  $raw = extractData($config['api_url']);
  $data = transformData($raw);

  $pdo = new PDO(
    "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
    $config['db_user'],
    $config['db_pass'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );

  loadData($pdo, $data);
  file_put_contents('../logs/etl.log', "[".date('c')."] ETL success: ".count($data)." rows\n", FILE_APPEND);
  echo "ETL completed successfully\n";

} catch (Exception $e) {
  file_put_contents('../logs/etl.log', "[".date('c')."] ETL error: ".$e->getMessage()."\n", FILE_APPEND);
  echo "Error: " . $e->getMessage();
}
