<?php
$file = "reviews.json";

if (file_exists($file)) {
    $reviews = json_decode(file_get_contents($file), true);
    if (is_array($reviews)) {
        echo json_encode($reviews);
    } else {
        echo json_encode([]);
    }
} else {
    echo json_encode([]);
}
?>


<?php
$file = "reviews.json";

if (file_exists($file)) {
    $reviews = json_decode(file_get_contents($file), true);
    echo json_encode($reviews);
} else {
    echo json_encode([]);
}
?>