<?php
$file = "reviews.json";

// Get JSON data from fetch()
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "No data received"]);
    exit;
}

// Read existing reviews
$reviews = [];
if (file_exists($file)) {
    $reviews = json_decode(file_get_contents($file), true);
    if (!is_array($reviews)) {
        $reviews = [];
    }
}

// Append new review
$reviews[] = [
    "name" => htmlspecialchars($data['name']),
    "profession" => htmlspecialchars($data['profession']),
    "rating" => (int)$data['rating'],
    "review" => htmlspecialchars($data['review']),
    "created_at" => date("Y-m-d H:i:s")
];

// Save back to file
file_put_contents($file, json_encode($reviews, JSON_PRETTY_PRINT));

echo json_encode(["success" => true]);
?>

<?php
$file = "reviews.json";
$uploadDir = "uploads/";

// Ensure upload directory exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Handle form data
$name = htmlspecialchars($_POST['name']);
$profession = htmlspecialchars($_POST['profession']);
$rating = (int)$_POST['rating'];
$review = htmlspecialchars($_POST['review']);

// Handle photo upload
$photoPath = "img/default-user.jpg"; // fallback
if (!empty($_FILES['photo']['name'])) {
    $targetFile = $uploadDir . time() . "_" . basename($_FILES["photo"]["name"]);
    if (move_uploaded_file($_FILES["photo"]["tmp_name"], $targetFile)) {
        $photoPath = $targetFile;
    }
}

// Read existing reviews
$reviews = [];
if (file_exists($file)) {
    $reviews = json_decode(file_get_contents($file), true);
    if (!is_array($reviews)) {
        $reviews = [];
    }
}

// Append new review
$reviews[] = [
    "name" => $name,
    "profession" => $profession,
    "rating" => $rating,
    "review" => $review,
    "photo" => $photoPath,
    "created_at" => date("Y-m-d H:i:s")
];

// Save back to file
file_put_contents($file, json_encode($reviews, JSON_PRETTY_PRINT));

echo json_encode(["success" => true]);
?>
