<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
        $resizedFile = $uploadDir . "thumb_" . time() . ".jpg";
        resizeImage($targetFile, $resizedFile, 80, 80);
        $photoPath = $resizedFile;
    }
}

function resizeImage($sourceFile, $destFile, $width, $height) {
    $info = getimagesize($sourceFile);
    $mime = $info['mime'];

    switch ($mime) {
        case 'image/jpeg': $image = imagecreatefromjpeg($sourceFile); break;
        case 'image/png': $image = imagecreatefrompng($sourceFile); break;
        case 'image/gif': $image = imagecreatefromgif($sourceFile); break;
        default: return false;
    }

    $origWidth = imagesx($image);
    $origHeight = imagesy($image);

    $thumb = imagecreatetruecolor($width, $height);
    imagecopyresampled($thumb, $image, 0, 0, 0, 0, $width, $height, $origWidth, $origHeight);

    imagejpeg($thumb, $destFile, 85);
    imagedestroy($image);
    imagedestroy($thumb);

    return true;
}

$reviews = [];
if (file_exists($file)) {
    $reviews = json_decode(file_get_contents($file), true);
    if (!is_array($reviews)) $reviews = [];
}

$reviews[] = [
    "name" => $name,
    "profession" => $profession,
    "rating" => $rating,
    "review" => $review,
    "photo" => $photoPath,
    "created_at" => date("Y-m-d H:i:s")
];

if (file_put_contents($file, json_encode($reviews, JSON_PRETTY_PRINT))) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Failed to save review"]);
}
?>