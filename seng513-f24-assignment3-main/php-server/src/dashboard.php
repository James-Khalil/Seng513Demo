<?php
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    // If not logged in, redirect to the login page
    header("Location: index.php");
    exit();
}

// Get the logged-in user's username from the session
$username = $_SESSION['username'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="nav-bar">
        <h2><?php echo htmlspecialchars($username); ?> logged in</h2>
        <form action="logout.php" method="post">
            <button type="submit">Log Out</button>
        </form>
    </div>
    
</body>
</html>
