@echo off
rem Instalador para Windows: roda o instalar.sh usando o bash que vem com o Git para Windows.
rem Basta dar duplo clique neste arquivo (o Docker Desktop precisa estar aberto).

cd /d "%~dp0"

set "BASH=%ProgramFiles%\Git\bin\bash.exe"
if not exist "%BASH%" set "BASH=%LocalAppData%\Programs\Git\bin\bash.exe"
if not exist "%BASH%" (
  echo Nao encontrei o Git para Windows. Instale em https://git-scm.com e rode de novo.
  pause
  exit /b 1
)

"%BASH%" ./instalar.sh
pause
