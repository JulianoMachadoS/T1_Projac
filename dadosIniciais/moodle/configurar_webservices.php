<?php
// Liga os web services do Moodle pra integracao e imprime o token do admin.
// Pode rodar de novo, o que ja existe e reaproveitado.

define('CLI_SCRIPT', true);
require '/opt/bitnami/moodle/config.php';

set_config('enablewebservices', 1);
set_config('webserviceprotocols', 'rest');

// o moodle so deixa chamar funcoes que estao num servico
$service = $DB->get_record('external_services', ['shortname' => 'integracao_ieducar']);
if (!$service) {
    $service = (object) [
        'name' => 'Integracao i-Educar',
        'shortname' => 'integracao_ieducar',
        'enabled' => 1,
        'restrictedusers' => 0, // qualquer usuario com token pode usar
        'timecreated' => time(),
    ];
    $service->id = $DB->insert_record('external_services', $service);
}

$functions = ['core_course_create_courses', 'core_course_update_courses', 'core_course_get_courses_by_field'];
foreach ($functions as $function) {
    $row = ['externalserviceid' => $service->id, 'functionname' => $function];
    if (!$DB->record_exists('external_services_functions', $row)) {
        $DB->insert_record('external_services_functions', (object) $row);
    }
}

// token do admin, assim nao precisa criar usuario nem permissao
$admin = get_admin();
\core\session\manager::set_user($admin);
$token = $DB->get_field('external_tokens', 'token', ['userid' => $admin->id, 'externalserviceid' => $service->id]);
if (!$token) {
    $token = \core_external\util::generate_token(EXTERNAL_TOKEN_PERMANENT, $service, $admin->id, context_system::instance());
}

echo $token . "\n";
