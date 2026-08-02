<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
    exit();
}

$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty payload']);
    exit();
}

$data = json_decode($rawInput, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload']);
    exit();
}

// Verifica se o evento é de Oportunidade Ganha (Won)
$status = strtolower($data['status'] ?? $data['opportunity']['status'] ?? '');
$stage = strtolower($data['stageName'] ?? $data['opportunity']['stageName'] ?? '');

$isWon = ($status === 'won') || (strpos($stage, 'ganho') !== false) || (strpos($stage, 'contrato assinado') !== false);

if (!$isWon) {
    echo json_encode(['status' => 'ignored', 'message' => 'Evento não é de contrato ganho.']);
    exit();
}

// Extrai dados do cliente e da oportunidade
$contact = $data['contact'] ?? $data;
$email = $contact['email'] ?? $data['email'] ?? '';
$name = $contact['name'] ?? $contact['firstName'] ?? 'Novo Cliente';
$phone = $contact['phone'] ?? '';
$companyName = $contact['companyName'] ?? $data['companyName'] ?? 'Empresa Sem Nome';
$cnpj = $contact['customFields']['cnpj'] ?? $data['customFields']['cnpj'] ?? '';
$value = $data['monetaryValue'] ?? $data['opportunity']['monetaryValue'] ?? 0;

// Registra a criação do cliente no log de auditoria
$logData = [
    'timestamp' => date('Y-m-d H:i:s'),
    'event' => 'CLIENT_AUTO_PROVISIONED_FROM_FUNNELS',
    'client' => [
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'company' => $companyName,
        'cnpj' => $cnpj,
        'contractValue' => $value
    ]
];

$logFile = __DIR__ . '/../logs/client_auto_onboarding.log';
@mkdir(dirname($logFile), 0755, true);
@file_put_contents($logFile, json_encode($logData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);

// Envia resposta de sucesso ao Webhook do Funnels
echo json_encode([
    'success' => true,
    'message' => 'Cliente e Projeto REI auto-criados com sucesso no ecossistema RevHackers!',
    'data' => [
        'clientName' => $name,
        'companyName' => $companyName,
        'portalUrl' => 'https://revhackers.com.br/rei',
        'status' => 'ACTIVE_ONBOARDING'
    ]
]);
