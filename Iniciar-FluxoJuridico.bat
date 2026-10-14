@echo off
REM ============================================================
REM  FLUXO JURIDICO - Iniciador com 1 clique
REM  De duplo clique neste arquivo para iniciar o projeto.
REM ============================================================
title Fluxo Juridico
cd /d "%~dp0"

echo.
echo  ============================================
echo   FLUXO JURIDICO - a iniciar...
echo  ============================================
echo.

where node >nul 2>nul
if errorlevel 1 goto :nonode

for /f "tokens=*" %%v in ('node --version') do echo  Node: %%v

if not exist "node_modules" goto :install
echo  [1 de 2] Dependencias OK.
goto :start

:install
echo  [1 de 2] Instalando dependencias, primeira vez apenas...
call npm install > "iniciar-log.txt" 2>&1
if errorlevel 1 goto :npmfail
goto :start

:nonode
echo  [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
echo.
echo  Pressione qualquer tecla para fechar...
pause >nul
exit /b 1

:npmfail
echo  [ERRO] Falha ao instalar dependencias. Veja o arquivo iniciar-log.txt.
echo.
echo  Pressione qualquer tecla para fechar...
pause >nul
exit /b 1

:start
echo.
echo  [2 de 2] A iniciar o servidor em http://localhost:3000
echo  O navegador vai abrir sozinho.
echo  Para PARAR o servidor, feche esta janela ou pressione Ctrl+C.
echo.
call npm run dev
set CODIGO=%errorlevel%

echo.
echo  O servidor parou. Codigo %CODIGO%.
echo  Pressione qualquer tecla para fechar esta janela...
pause >nul