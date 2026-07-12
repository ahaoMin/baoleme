#!/usr/bin/env bash
# 在阿里云 Ubuntu 上首次执行（SSH 登录后）：
#   curl -sL ... 或把本脚本上传后：
#   bash setup-server.sh
set -euo pipefail

DOMAIN="${DOMAIN:-a.baoleme.site}"
WEB_ROOT="${WEB_ROOT:-/var/www/baoleme}"
NGINX_SITE="/etc/nginx/sites-available/${DOMAIN}"

echo "==> 安装 Nginx"
sudo apt update
sudo apt install -y nginx

echo "==> 创建站点目录 ${WEB_ROOT}"
sudo mkdir -p "${WEB_ROOT}"
sudo chown -R www-data:www-data "${WEB_ROOT}"
# 部署账号需要可写（默认当前用户）
sudo usermod -aG www-data "${USER}" || true
sudo chmod -R g+w "${WEB_ROOT}"

echo "==> 写入 Nginx 配置"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "${SCRIPT_DIR}/nginx-a.baoleme.site.conf" ]]; then
  sudo cp "${SCRIPT_DIR}/nginx-a.baoleme.site.conf" "${NGINX_SITE}"
else
  echo "请把 nginx-a.baoleme.site.conf 与本脚本放在同目录后再跑"
  exit 1
fi

sudo ln -sfn "${NGINX_SITE}" "/etc/nginx/sites-enabled/${DOMAIN}"
# 去掉默认站点冲突（可选）
sudo rm -f /etc/nginx/sites-enabled/default

echo "==> 检查并重载 Nginx"
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx

echo "==> 可选：申请 HTTPS（域名已解析到本机后再执行）"
echo "    sudo apt install -y certbot python3-certbot-nginx"
echo "    sudo certbot --nginx -d ${DOMAIN}"

echo ""
echo "完成。请确认："
echo "  1) 阿里云安全组已放行 80/443"
echo "  2) DNS：${DOMAIN} A 记录 → 本机公网 IP"
echo "  3) GitHub Secrets 配好后，push main 会自动发布到 ${WEB_ROOT}"
