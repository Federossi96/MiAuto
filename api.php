<?php
// Habilitar reporte de errores para depuración (quitar en producción)
error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar errores en pantalla, solo en logs

// Iniciar buffer para evitar salidas accidentales
ob_start();

// Establecer encabezados
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Conexión a la base de datos
$conn = new mysqli("localhost", "root", "", "drovez_demo");
$conn->set_charset("utf8mb4");

if ($conn->connect_error) {
    ob_end_clean();
    echo json_encode(['error' => 'Conexión fallida: ' . $conn->connect_error]);
    exit;
}

// Obtener datos del POST
$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
$marca = isset($_POST['marca']) ? $conn->real_escape_string($_POST['marca']) : '';
$precioMin = isset($_POST['precioMin']) ? (int)$_POST['precioMin'] : 0;
$precioMax = isset($_POST['precioMax']) ? (int)$_POST['precioMax'] : PHP_INT_MAX;
$kmMax = isset($_POST['kmMax']) ? (int)$_POST['kmMax'] : PHP_INT_MAX;
$year = isset($_POST['year']) ? (int)$_POST['year'] : 0;
$sort = isset($_POST['sort']) ? $conn->real_escape_string($_POST['sort']) : '';
$page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
$limit = isset($_POST['limit']) ? (int)$_POST['limit'] : 6;
$offset = ($page - 1) * $limit;

// Construir cláusula WHERE
$where = [];
if ($id) $where[] = "id = $id";
if ($marca) $where[] = "marca LIKE '%$marca%'";
if ($precioMin) $where[] = "precio >= $precioMin";
if ($precioMax < PHP_INT_MAX) $where[] = "precio <= $precioMax";
if ($kmMax < PHP_INT_MAX) $where[] = "kilometros <= $kmMax";
if ($year) $where[] = "anio >= $year";
$whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

// Ordenamiento
$orderBy = '';
if ($sort === 'price-asc') $orderBy = 'ORDER BY precio ASC';
elseif ($sort === 'price-desc') $orderBy = 'ORDER BY precio DESC';
elseif ($sort === 'km-asc') $orderBy = 'ORDER BY kilometros ASC';
elseif ($sort === 'km-desc') $orderBy = 'ORDER BY kilometros DESC';
elseif ($sort === 'year-asc') $orderBy = 'ORDER BY anio ASC';
elseif ($sort === 'year-desc') $orderBy = 'ORDER BY anio DESC';

// Consultas
$query = "SELECT *, (2025 - anio) AS edad FROM cars $whereClause $orderBy LIMIT $offset, $limit";
$totalQuery = "SELECT COUNT(*) as total FROM cars $whereClause";

// Ejecutar consultas
$result = $conn->query($query);
$totalResult = $conn->query($totalQuery);

if (!$result || !$totalResult) {
    ob_end_clean();
    echo json_encode(['error' => 'Error en la consulta: ' . $conn->error]);
    $conn->close();
    exit;
}

// Obtener resultados
$total = $totalResult->fetch_assoc()['total'];
$cars = [];
while ($row = $result->fetch_assoc()) {
    $cars[] = $row;
}

// Limpiar buffer y enviar respuesta
ob_end_clean();
echo json_encode(['cars' => $cars, 'total' => $total], JSON_UNESCAPED_UNICODE | JSON_NUMERIC_CHECK);

// Cerrar conexión
$conn->close();
?>