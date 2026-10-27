#!/bin/sh
# Configura o Moodle e grava o token no .env. Rodar na raiz, com os containers de pe.

# -u daemon: mesmo usuario do apache, senao o cache do moodle fica com dono root
TOKEN=$(docker compose exec -T -u daemon moodle php < dadosIniciais/moodle/configurar_webservices.php)

sed -i.bak "s#^MOODLE_TOKEN=.*#MOODLE_TOKEN=$TOKEN#" .env && rm .env.bak
echo "MOODLE_TOKEN gravado no .env"
