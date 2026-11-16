
<?php
require_once __DIR__ . "/config/koneksi.php";

$pesan = "";
$berhasil = false;

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $nama = trim($_POST["name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $password = $_POST["password"] ?? "";

    if ($nama === "" || $email === "" || $password === "") {
        $pesan = "Semua kolom wajib diisi.";

    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $pesan = "Format email tidak valid.";

    } elseif (strlen($password) < 8) {
        $pesan = "Password minimal 8 karakter.";

    } else {
        try {
            // Pastikan belum ada administrator
            $check = $pdo->query("SELECT COUNT(*) FROM admins");
            $jumlah = (int) $check->fetchColumn();

            if ($jumlah > 0) {
                $pesan = "Akun administrator sudah tersedia. Pembuatan akun baru ditutup.";

            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);

                $sql = "INSERT INTO admins
                        (name, email, password, role)
                        VALUES (:name, :email, :password, 'super_admin')";

                $stmt = $pdo->prepare($sql);

                $stmt->execute([
                    "name" => $nama,
                    "email" => $email,
                    "password" => $hash
                ]);

                $berhasil = true;
                $pesan = "Akun administrator berhasil dibuat.";
            }

        } catch (PDOException $e) {
            error_log($e->getMessage());
            $pesan = "Terjadi kesalahan saat membuat akun.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Buat Admin ITC</title>
</head>
<body>

    <h2>Pembuatan Administrator ITC</h2>

    <?php if ($pesan !== ""): ?>
        <p><?= htmlspecialchars($pesan) ?></p>
    <?php endif; ?>

    <?php if (!$berhasil): ?>
    <form method="POST">
        <label>Nama lengkap</label><br>
        <input type="text" name="name" required>
        <br><br>

        <label>Email administrator</label><br>
        <input type="email" name="email" required>
        <br><br>

        <label>Password (minimal 8 karakter)</label><br>
        <input type="password" name="password"
               minlength="8" required>
        <br><br>

        <button type="submit">Buat Akun Administrator</button>
    </form>
    <?php endif; ?>

</body>
</html>
