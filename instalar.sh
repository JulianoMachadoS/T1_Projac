#!/bin/sh
# Sobe o ambiente inteiro e deixa i-Educar e Moodle prontos pra integracao.
set -e
cd "$(dirname "$0")"

[ -f .env ] || cp .env.example .env

# o build da imagem do i-Educar usa o uid/gid do usuario, evita erro de permissao no vendor/
if [ ! -f i-educar/.env ]; then
  cp i-educar/.env.example i-educar/.env
  printf '\nHOST_UID=%s\nHOST_GID=%s\n' "$(id -u)" "$(id -g)" >> i-educar/.env
fi

docker compose up -d --build

# i-Educar: so instala se ainda nao tem token (na segunda vez pula, senao duplica as turmas)
if ! grep -q '^IEDUCAR_TOKEN=.' .env; then
  until docker compose exec -T postgres pg_isready -q; do sleep 2; done

  docker compose exec -T php composer install
  docker compose exec -T php composer set-permissions
  docker compose exec -T php php artisan key:generate
  docker compose exec -T php php artisan storage:link
  docker compose exec -T php php artisan migrate --force
  docker compose exec -T php php artisan db:seed --force
  docker compose exec -T php php artisan db:seed --class=DemoSeeder --force

  TOKEN=$(docker compose exec -T php php artisan admin:token integracao --no-ansi | tail -n 1 | tr -d ' ')
  sed -i.bak "s#^IEDUCAR_TOKEN=.*#IEDUCAR_TOKEN=$TOKEN#" .env && rm .env.bak
fi

# Moodle se instala sozinho na primeira vez, demora uns minutos
echo "Esperando o Moodle terminar de instalar..."
until curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/login/index.php | grep -q 200; do sleep 10; done
./dadosIniciais/configurar-moodle.sh

# recria a integracao pra ela ler os tokens novos do .env
docker compose up -d --force-recreate integration

echo ""
echo "Pronto!"
echo "  i-Educar:   http://localhost        (admin / 123456789)"
echo "  Moodle:     http://localhost:8080   (user / bitnami)"
echo "  Integracao: http://localhost:3000"
