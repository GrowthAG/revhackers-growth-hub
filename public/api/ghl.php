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

// Strict whitelist of GHL v2 API top-level properties
$allowedKeys = [
    'locationId',
    'firstName',
    'lastName',
    'email',
    'phone',
    'companyName',
    'website',
    'source',
    'tags',
    'customFields'
];

$cleanPayload = [
    'locationId' => 'oFTw9DcsKRUj6xCiq4mb'
];

foreach ($allowedKeys as $key) {
    if (array_key_exists($key, $data) && $data[$key] !== null) {
        $cleanPayload[$key] = $data[$key];
    }
}

// Guarantee tag for Claude Partner Network
if (!isset($cleanPayload['tags']) || !is_array($cleanPayload['tags'])) {
    $cleanPayload['tags'] = ['claude-partner-network'];
} else if (!in_array('claude-partner-network', $cleanPayload['tags'])) {
    $cleanPayload['tags'][] = 'claude-partner-network';
}

$token = 'pit-9285a0fa-9c63-4475-8a39-93f3476d6a81';

// Use GHL Contacts Upsert Endpoint
$ch = curl_init('https://services.leadconnectorhq.com/contacts/upsert');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($cleanPayload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Version: 2021-07-28',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => $curlError]);
    exit();
}

$ghlData = json_decode($response, true);
$contactId = $ghlData['contact']['id'] ?? null;

// Send email via GHL Conversations API + PHP Mail fallback
if (!empty($cleanPayload['email'])) {
    dispatchConfirmationEmail(
        $cleanPayload['email'],
        $cleanPayload['firstName'] ?? 'Parceiro',
        $cleanPayload['companyName'] ?? 'Sua Empresa',
        $contactId,
        $token
    );
}

http_response_code($httpCode >= 200 && $httpCode < 300 ? 200 : 200);
echo $response;

function dispatchConfirmationEmail($toEmail, $firstName, $companyName, $contactId, $token) {
    $templatePath = __DIR__ . '/../templates/email-claude-partner-network.html';
    if (!file_exists($templatePath)) {
        return false;
    }

    $htmlBody = file_get_contents($templatePath);
    
    // Replace GHL style placeholders with lead values
    $htmlBody = str_replace(['{{contact.first_name}}', '{{firstName}}'], htmlspecialchars($firstName), $htmlBody);
    $htmlBody = str_replace(['{{contact.company_name}}', '{{companyName}}'], htmlspecialchars($companyName), $htmlBody);
    $htmlBody = str_replace(['{{right_now.year}}'], date('Y'), $htmlBody);
    $htmlBody = str_replace(['{{location.name}}'], 'RevHackers', $htmlBody);

    $subject = "Você está dentro. Seja bem-vindo ao Claude Partner Network.";

    // 1. Send via GHL Conversations API (Verified LC Mail / SendGrid for Location oFTw9DcsKRUj6xCiq4mb)
    if ($contactId) {
        $ghlMsgPayload = [
            'type' => 'Email',
            'contactId' => $contactId,
            'emailTo' => $toEmail,
            'subject' => $subject,
            'html' => $htmlBody,
            'locationId' => 'oFTw9DcsKRUj6xCiq4mb'
        ];

        $chGhl = curl_init('https://services.leadconnectorhq.com/conversations/messages');
        curl_setopt($chGhl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($chGhl, CURLOPT_POST, true);
        curl_setopt($chGhl, CURLOPT_POSTFIELDS, json_encode($ghlMsgPayload));
        curl_setopt($chGhl, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Version: 2021-07-28',
            'Content-Type: application/json'
        ]);
        curl_setopt($chGhl, CURLOPT_SSL_VERIFYPEER, true);
        curl_exec($chGhl);
        curl_close($chGhl);
    }

    // 2. Secondary fallback: Send via PHP mail()
    $subjectEncoded = "=?UTF-8?B?" . base64_encode($subject) . "?=";
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: RevHackers <contato@revhackers.com.br>\r\n";
    $headers .= "Reply-To: contato@revhackers.com.br\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    @mail($toEmail, $subjectEncoded, $htmlBody, $headers);
}
