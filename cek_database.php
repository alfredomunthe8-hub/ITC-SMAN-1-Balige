
<?php

error_reporting(E_ALL);
ini_set("display_errors", "1");

require_once __DIR__ . "/config/koneksi.php";

echo "<h2>DIAGNOSTIK DATABASE ITC</h2>";

try {

    echo "<p style='color:green'>1. Koneksi database berhasil.</p>";

    $sql = "
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
    ";

    $stmt = $pdo->query($sql);
    $daftarTabel = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "<h3>2. Daftar tabel database</h3>";

    if (empty($daftarTabel)) {
        echo "<p style='color:red'>Tidak ditemukan tabel.</p>";
    } else {
        foreach ($daftarTabel as $nama) {
            echo "<p style='color:green'>";
            echo "Tabel ditemukan: " . htmlspecialchars($nama);
            echo "</p>";
        }
    }

    echo "<h3>3. Pemeriksaan lima tabel utama</h3>";

    $target = [
        "admins",
        "galleries",
        "members",
        "programs",
        "registrations",
        "site_settings",
    ];

    foreach ($target as $namaTabel) {

        if (in_array($namaTabel, $daftarTabel, true)) {

            $stmt = $pdo->query(
                "SELECT COUNT(*) FROM `$namaTabel`"
            );

            $jumlah = $stmt->fetchColumn();

            echo "<p style='color:green'>";
            echo "BERHASIL: " . htmlspecialchars($namaTabel);
            echo " — Jumlah data: " . (int)$jumlah;
            echo "</p>";

        } else {

            echo "<p style='color:red'>";
            echo "TABEL TIDAK DITEMUKAN: ";
            echo htmlspecialchars($namaTabel);
            echo "</p>";

        }
    }

} catch (Throwable $e) {

    echo "<h3 style='color:red'>TERJADI ERROR</h3>";

    echo "<pre>";
    echo htmlspecialchars($e->getMessage());
    echo "</pre>";

}

?>
