<?php
$file = "reviews.json";
$uploadDir = "uploads/";

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$name = htmlspecialchars($_POST['name']);
$profession = htmlspecialchars($_POST['profession']);
$rating = (int)$_POST['rating'];
$review = htmlspecialchars($_POST['review']);

$photoPath = "img/default-user.jpg"; // fallback
if (!empty($_FILES['photo']['name'])) {
    $targetFile = $uploadDir . time() . "_" . basename($_FILES["photo"]["name"]);
    if (move_uploaded_file($_FILES["photo"]["tmp_name"], $targetFile)) {
        $photoPath = $targetFile;
    }
}

// Load existing reviews
$reviews = [];
if (file_exists($file)) {
    $reviews = json_decode(file_get_contents($file), true);
    if (!is_array($reviews)) $reviews = [];
}

// Add new review
$reviews[] = [
    "name" => $name,
    "profession" => $profession,
    "rating" => $rating,
    "review" => $review,
    "photo" => $photoPath,
    "created_at" => date("Y-m-d H:i:s")
];

// Save back to JSON
if (file_put_contents($file, json_encode($reviews, JSON_PRETTY_PRINT))) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Failed to save review"]);
}
?>