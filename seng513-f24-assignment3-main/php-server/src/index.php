<?php
session_start();

// Database connection
$dbHost = 'db';
$dbName = getenv('MYSQL_DATABASE');
$dbUser = getenv('MYSQL_USER');
$dbPass = getenv('MYSQL_PASSWORD');

try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

$error = '';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    // Query user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);


    $hashedEnteredPassword = hash('sha256', $password);
    if ($user && $hashedEnteredPassword === $user['password']) {
        // Login successful
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['is_admin'] = $user['is_admin']; // Store admin status

        // Redirect based on role
        if ($user['is_admin']) {
            header("Location: admin.php");
            exit();
        } else {
            header("Location: dashboard.php");
            exit();
        }
    } else {
        $error = "Incorrect username or password. Please try again.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="login-box">
    <h2>Login</h2>

    <!-- Display error if username or password is incorrect -->
    <?php if ($error): ?>
        <div class="error"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    
    <form method="post" action="index.php">
        <div class="form-input">
            <label for="username">Username:</label><br>
            <input type="text" id="username" name="username" required><br><br>
        </div>
        
        <div class="form-input">
            <label for="password">Password:</label><br>
            <input type="password" id="password" name="password" required><br><br>
        </div>
        
        <button type="submit">Log In</button>
    </form>
        <p>Don't have an account? <a href="register.php">Create an account</a></p>
    </div>
</body>
</html>
