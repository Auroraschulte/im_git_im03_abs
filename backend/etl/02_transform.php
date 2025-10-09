<?php
require_once('01_extract.php');

function transformLuzernData() {
    $raw = fetchLuzernData();
    $standorte = $raw['data'];

    $transformed_data = [];
    foreach ($standorte as $standort) {
        $transformed_data[] = [
            'counter' => $standort['counter'],
            'name' => $standort['name']
        ];
    }

    return $transformed_data;
}
