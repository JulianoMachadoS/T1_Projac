1. O que deve ser integrado?

Escolhemos duas possibilidades principais:

- Turmas e disciplinas: enviar do iEducar para o Moodle a escola, o ano letivo, o nome da turma, o curso/etapa, as disciplinas e, quando possível, o professor responsável. No Moodle, uma turma pode ser representada por um curso ou por uma categoria e seus cursos.
- Pessoas e matrículas: sincronizar alunos ativos, seus dados básicos de identificação e as matrículas/enturmações. No Moodle, o aluno deve existir como usuário e ser inscrito no curso correspondente à turma.

Como evolução, também seria possível sincronizar notas e frequência do Moodle de volta para o iEducar, mas esse fluxo exige definir qual sistema será o responsável pelo dado e como os períodos e componentes curriculares serão mapeados.

2. Qual será a fonte de cada informação?

- Turmas: a entidade `LegacySchoolClass`, em `i-educar/app/Models/LegacySchoolClass.php`, usa a tabela legada `pmieducar.turma`. Ela possui, entre outros, `cod_turma`, `nm_turma`, `ano`, `ref_cod_curso`, `ref_ref_cod_escola`, `ref_ref_cod_serie`, período e situação de visibilidade/atividade. As relações com curso, escola, série e matrículas completam os dados necessários.
- Alunos: a entidade `LegacyStudent`, em `i-educar/app/Models/LegacyStudent.php`, usa `pmieducar.aluno`, com chave `cod_aluno`. O nome e outros dados pessoais são obtidos pelas relações com pessoa/indivíduo. O cadastro moderno `Student` também mantém a relação com `registrations`.
- Matrículas/enturmações: vêm do domínio de matrícula do iEducar, especialmente da tabela legada `pmieducar.matricula_turma` e dos modelos de matrícula relacionados à entidade `LegacySchoolClass`. Esse vínculo informa em qual turma o aluno deve ser inscrito.
- Cursos e disciplinas: são tratados pelos modelos legados de curso e disciplina e já aparecem como recursos da API do iEducar.

3. Quando a integração deve acontecer?

- A criação ou alteração de uma turma deve gerar uma sincronização assíncrona quase imediata. O iEducar já dispara o evento `StudentCreated` para alunos; podemos seguir o mesmo padrão com eventos de turma e matrícula, publicados para uma fila.
- A criação/alteração de aluno e matrícula deve ser enviada após a confirmação da transação, para não sincronizar dados que falharam no banco.
- Um job periódico, por exemplo a cada 15 minutos ou diariamente, deve fazer reconciliação. Ele corrige falhas de rede, reprocessa mensagens e encontra diferenças entre os sistemas.
- Deve existir também uma ação manual de “sincronizar agora”, útil para a primeira carga e para suporte.

4. Como o monólito poderia disponibilizar essas informações?

O iEducar já possui API REST em `routes/api.php`. Ela registra recursos autenticados para `course`, `school-class`, `registration`, `school`, `grade`, `discipline` e outros, além de endpoints de calendário e etapas de uma turma. O acesso usa Sanctum nos recursos protegidos.

Para o microsserviço, propomos:

- consumir esses endpoints, em vez de acessar diretamente o banco do iEducar;
- criar no microsserviço um adaptador que transforme o modelo iEducar no modelo Moodle;
- adicionar endpoints ou eventos específicos de integração, como `GET /api/integration/school-classes?updated_since=...` e eventos `SchoolClassCreated`, `RegistrationCreated` e `StudentUpdated`;
- guardar uma tabela de mapeamento com `ieducar_id`, `moodle_id`, tipo do objeto, última sincronização e status/erro;
- usar token, HTTPS, paginação, idempotência e uma fila com retentativas. O microsserviço não deve expor senha nem dados pessoais além do necessário.

5. O que seria necessário fazer no Moodle?

O Moodle possui Web services. Deve-se habilitar um serviço externo, criar um usuário técnico com as permissões mínimas, selecionar o protocolo REST e gerar um token. O microsserviço poderá chamar funções como:

- `core_course_create_courses` para criar cursos;
- `core_course_update_courses` para alterar nome, período ou visibilidade;
- `core_user_create_users` e `core_user_update_users` para manter usuários;
- `enrol_manual_enrol_users` para inscrever alunos e professores;
- `core_enrol_get_enrolled_users` para conferir o resultado da sincronização.

Também será necessário definir categorias por escola/ano, um identificador externo estável para cada objeto, o método de autenticação dos usuários e o papel de aluno/professor. A documentação e as funções disponíveis devem ser conferidas na versão instalada do Moodle, pois permissões e nomes podem variar entre versões. O Moodle também pode usar LDAP/OAuth2/SAML para autenticação, mas isso é complementar à sincronização dos cursos e matrículas.

6. Escolha de um primeiro caso de integração

Implementaríamos primeiro:

“Quando uma nova turma ativa for criada no iEducar, criar o curso correspondente no Moodle e registrar o vínculo entre os dois identificadores.”

Esse caso tem escopo menor que a sincronização de usuários e matrículas, produz um resultado visível e cria a base para os próximos fluxos. O identificador do curso no Moodle ficaria associado ao `cod_turma` do iEducar; assim, uma nova tentativa não criaria duplicatas.

7. Fluxo simples

```text
Usuário cria/ativa uma turma no iEducar
					 |
					 v
Evento ou job identifica a turma alterada
					 |
					 v
Microsserviço consulta a API REST do iEducar
					 |
					 v
Verifica o mapeamento cod_turma -> moodle_course_id
			 |                         |
		 existe                    não existe
			 |                         |
			 v                         v
Atualiza curso no Moodle    Chama core_course_create_courses
												  |
												  v
								 Salva o vínculo e o resultado
												  |
												  v
								 Registra sucesso ou erro para retentativa
```

Depois desse primeiro caso, a criação de uma matrícula dispararia a criação/atualização do usuário e a chamada de `enrol_manual_enrol_users` para o curso já mapeado.

8. Quais desafios antecipamos?

- Mapear conceitos diferentes: turma do iEducar, curso/categoria/grupo do Moodle e disciplina podem não ter correspondência um para um.
- Evitar duplicidade e inconsistência usando identificadores estáveis, idempotência e tabela de mapeamento.
- Tratar falhas de rede, limite de requisições, timeout, indisponibilidade e retentativas sem criar cursos duplicados.
- Definir o que acontece em alterações, transferência de aluno, cancelamento de matrícula, arquivamento e exclusão. Preferimos desativar/ocultar no Moodle a apagar dados automaticamente.
- Proteger dados pessoais e credenciais, aplicando LGPD, HTTPS, menor privilégio e logs sem CPF, senha ou outros dados sensíveis.
- Resolver autenticação e possíveis contas já existentes no Moodle, inclusive o conflito entre e-mail, username e identificador do iEducar.
- Sincronizar períodos, notas, frequência e fuso horário sem perder a origem oficial de cada informação.
- Monitorar a operação: fila de erros, correlação por identificador, painel de status e uma rotina de reconciliação para detectar divergências.
