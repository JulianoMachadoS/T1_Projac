#!/bin/sh
# Teste de ponta a ponta: cria uma turma no i-Educar, sincroniza e confere o curso no Moodle e o vinculo.
# Rodar na raiz, com o ambiente de pe (./instalar.sh). No fim apaga o que criou.
cd "$(dirname "$0")"

echo "1) Criando uma turma nova no i-Educar (copia da turma 3)..."
TURMA=$(docker compose exec -T php php artisan tinker --execute="\$t = App\Models\LegacySchoolClass::find(3)->replicate(); \$t->nm_turma = 'Turma Teste Integracao'; \$t->save(); echo \$t->cod_turma;" | tail -n 1)
echo "   turma criada: $TURMA"

echo "2) Disparando a sincronizacao (POST /sincronizacao/turmas)..."
curl -s -X POST http://localhost:3000/sincronizacao/turmas
echo ""

echo "3) Conferindo o curso no Moodle (idnumber ieducar-turma-$TURMA)..."
CURSO=$(docker compose exec -T integration sh -c "wget -qO- \"\$MOODLE_URL/webservice/rest/server.php?wstoken=\$MOODLE_TOKEN&wsfunction=core_course_get_courses_by_field&moodlewsrestformat=json&field=idnumber&value=ieducar-turma-$TURMA\"" | grep -o '"courses":\[{"id":[0-9]*' | grep -o '[0-9]*$')
echo "   curso no Moodle: ${CURSO:-nao encontrado}"

echo "4) Conferindo o vinculo no banco da integracao..."
VINCULO=$(docker compose exec -T integration-db psql -U integration -d integration -tA -c "select curso_id from vinculo_turma_curso where turma_id = $TURMA")
echo "   vinculo: turma $TURMA -> curso ${VINCULO:-nao encontrado}"

if [ -n "$CURSO" ] && [ "$CURSO" = "$VINCULO" ]; then
  RESULTADO="OK: a turma $TURMA virou o curso $CURSO e o vinculo foi gravado"
else
  RESULTADO="FALHOU"
fi

# limpeza: o teste nao deixa a turma, o curso nem o vinculo pra tras
echo "5) Apagando o que o teste criou..."
docker compose exec -T php php artisan tinker --execute="App\Models\LegacySchoolClass::find($TURMA)?->delete();" > /dev/null
[ -n "$CURSO" ] && docker compose exec -T -u daemon moodle php -r "define('CLI_SCRIPT', true); require '/opt/bitnami/moodle/config.php'; require_once \$CFG->dirroot.'/course/lib.php'; delete_course($CURSO, false);" > /dev/null
docker compose exec -T integration-db psql -U integration -d integration -qtA -c "delete from vinculo_turma_curso where turma_id = $TURMA"

echo ""
echo "$RESULTADO"
[ "$RESULTADO" != "FALHOU" ]
