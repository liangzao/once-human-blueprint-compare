@echo off
chcp 65001 >nul
title 七日世界图纸对比 - 手机访问服务
cd /d "%~dp0"
echo ============================================
echo   正在启动局域网服务...
echo   请保持本窗口打开（关闭即停止服务）
echo.
echo   手机连接【同一 Wi-Fi】后，用浏览器打开：
echo.
ipconfig | findstr /C:"IPv4" | findstr "192.168 10. 172."
echo.
echo   在以上 IP 后面加上 :8080
echo   例如 http://192.168.1.8:8080
echo ============================================
echo.
echo 如果手机打不开，请检查 Windows 防火墙是否放行了 8080 端口
echo.
npx vite preview --host 0.0.0.0 --port 8080
pause
