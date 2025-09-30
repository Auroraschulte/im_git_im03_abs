<?php
$data = include('01_extract.php');

$standorte = $data ['data'];

$transformed_data = [];
foreach($standorte as $standort) {
    $transformed_data[] = [
        'counter' => $standort['counter'],
        'name' => $standort['name']
    ];
}

echo '<pre>';
print_r($transformed_data);
echo '</pre>';
?>