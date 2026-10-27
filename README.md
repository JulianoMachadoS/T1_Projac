# T1 – Integração i-Educar + Moodle

**Autores:** Juliano Machado da Silva e João Pedro Madruga

## Como rodar

Pré-requisito: Docker com Docker Compose.

```bash
./instalar.sh
```

## O que o comando faz

1. Cria o arquivo `.env` com as configurações.
2. Sobe os três sistemas com Docker: i-Educar, Moodle e o serviço de integração.
3. Instala o i-Educar e cria dados de exemplo (escolas, turmas e alunos).
4. Ativa a API (Web Services) do Moodle.
5. Gera os tokens de acesso do i-Educar e do Moodle e grava no `.env`.

A primeira execução leva alguns minutos. Depois, para subir o ambiente de novo, basta `docker compose up -d`.

## Acessos

| Sistema    | Endereço              | Usuário / senha      |
|------------|-----------------------|----------------------|
| i-Educar   | http://localhost      | `admin` / `123456789` |
| Moodle     | http://localhost:8080 | `user` / `bitnami`   |
| Integração | http://localhost:3000 | —                    |
