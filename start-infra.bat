@echo off
chcp 65001 >nul
echo === 启动 LIMS 基础设施 (MySQL + Redis) ===
start "LIMS-MySQL" /D "D:\mysql-8.4.9-winx64\bin" mysqld.exe --defaults-file=D:\mysql-8.4.9-winx64\my.ini --console
start "LIMS-Redis" /D "D:\redis" redis-server.exe --port 6379
echo.
echo MySQL(3306) 和 Redis(6379) 已启动（在新窗口中运行，关闭窗口即停止）。
echo 接下来分别在 web\ 和 server\ 目录执行 pnpm dev / pnpm start:dev 启动前后端。
echo.
pause
