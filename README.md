# T1 – Integração i-Educar + Moodle

**Autores:** Juliano Machado da Silva e João Pedro Madruga

## Como rodar

Pré-requisito: Docker com Docker Compose.

```bash
./instalar.sh
```

**No Windows:** com o Docker Desktop aberto, dê duplo clique em `instalar.bat`. Ele usa o terminal que vem com o Git para Windows, sem precisar instalar mais nada. Os outros comandos deste README podem ser rodados no **Git Bash**.

## O que o comando faz

1. Cria o arquivo `.env` com as configurações.
2. Sobe os três sistemas com Docker: i-Educar, Moodle e o serviço de integração.
3. Instala o i-Educar e cria dados de exemplo (escolas, turmas e alunos).
4. Ativa a API (Web Services) do Moodle.
5. Gera os tokens de acesso do i-Educar e do Moodle e grava no `.env`.

A primeira execução leva alguns minutos. Depois, para subir o ambiente de novo, basta `docker compose up -d`.

## Acessos

Os usuários já vêm criados pela instalação, não é preciso cadastrar.

| Sistema    | Endereço              | Login   | Senha       |
|------------|-----------------------|---------|-------------|
| i-Educar   | http://localhost      | `admin` | `123456789` |
| Moodle     | http://localhost:8080 | `user`  | `bitnami`   |
| Integração | `POST http://localhost:3000/sincronizacao/turmas` | — | — |

Os dois logins são de administrador.

## O que foi integrado

**Turmas do i-Educar → cursos do Moodle.** Quando uma turma ativa do ano atual é criada no i-Educar, a integração cria o curso correspondente no Moodle e grava o vínculo entre os dois (id da turma ↔ id do curso) no banco próprio. A sincronização roda sozinha a cada minuto e também pode ser disparada pelo endpoint acima.

| Turma no i-Educar | Curso no Moodle |
|---|---|
| Nome da turma | Nome do curso |
| Código da turma (ex.: 23) | Nome curto `turma-23` e código `ieducar-turma-23` |

Alunos, professores e notas não são sincronizados: ficam só no i-Educar.

## O que dá para fazer

| Onde | O que fazer |
|---|---|
| i-Educar | Cadastrar e consultar escolas, turmas, alunos e matrículas. Já vem com 2 escolas, 21 turmas e 210 alunos de exemplo. Turmas novas viram cursos no Moodle. |
| Moodle | Ver os cursos criados pela integração, um por turma, em *Category 1*. |
| Integração | Disparar a sincronização na hora e consultar o vínculo turma ↔ curso e o histórico de cada execução (ver "Como testar"). |

## Como testar

**1. Ver os cursos criados.** Depois da instalação, espere 1 minuto, entre no Moodle e abra *Site administration > Courses > Manage courses and categories* (http://localhost:8080/course/management.php). As 21 turmas de exemplo do i-Educar aparecem como cursos (nome curto `turma-<id>`).

**2. Disparar a sincronização na hora.**

```bash
curl -X POST http://localhost:3000/sincronizacao/turmas
```

Resposta esperada, quando todas as turmas já têm curso:

```json
{"totalTurmas":21,"cursosCriados":0,"turmasIgnoradas":21,"falhas":[]}
```

**3. Criar uma turma e ver o curso aparecer.** No i-Educar, cadastre uma turma em *Escola > Cadastros > Turmas* (http://localhost/intranet/educar_turma_lst.php). Em até 1 minuto, ela aparece como curso no Moodle.

**4. Teste de ponta a ponta automático.** Cria uma turma no i-Educar, sincroniza, confere o curso no Moodle e o vínculo no banco, e apaga o que criou:

```bash
./testar-integracao.sh
```

**5. Testes automatizados do código** (não precisam do i-Educar nem do Moodle):

```bash
docker compose exec integration npm test
```

**6. Ver o vínculo e o histórico no banco da integração.**

```bash
docker compose exec integration-db psql -U integration -c "select * from vinculo_turma_curso"
docker compose exec integration-db psql -U integration -c "select * from historico_sincronizacao order by id desc limit 5"
```
