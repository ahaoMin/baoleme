#!/usr/bin/env bash
# 在已 SSH 登录的 Ubuntu 服务器上粘贴执行（一次性）
# 用法：把下面整段复制到服务器终端，或：
#   bash -s <<'EOF'
#   ...本文件内容...
#   EOF
set -euo pipefail

DOMAIN="a.baoleme.site"
WEB_ROOT="/var/www/baoleme"
DEPLOY_USER="${SUDO_USER:-$USER}"
if [[ "$(id -u)" -eq 0 ]]; then
  DEPLOY_USER="${SUDO_USER:-root}"
fi

echo "==> 安装 Nginx / certbot"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx

echo "==> 站点目录 ${WEB_ROOT}"
mkdir -p "${WEB_ROOT}"
if [[ "${DEPLOY_USER}" != "root" ]]; then
  chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${WEB_ROOT}"
else
  chown -R www-data:www-data "${WEB_ROOT}"
  chmod -R g+w "${WEB_ROOT}"
fi

echo "==> 写入 Nginx 配置"
cat >/etc/nginx/sites-available/${DOMAIN} <<'NGINX'
server {
    listen 80;
    listen [::]:80;
    server_name a.baoleme.site;

    root /var/www/baoleme;
    index index.html;

    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;
}
NGINX

ln -sfn /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx

echo "==> 准备部署账号 SSH 公钥目录"
HOME_DIR="$(eval echo "~${DEPLOY_USER}")"
if [[ "${DEPLOY_USER}" == "root" ]]; then HOME_DIR="/root"; fi
mkdir -p "${HOME_DIR}/.ssh"
chmod 700 "${HOME_DIR}/.ssh"
touch "${HOME_DIR}/.ssh/authorized_keys"
chmod 600 "${HOME_DIR}/.ssh/authorized_keys"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${HOME_DIR}/.ssh" 2>/dev/null || true

echo ""
echo "=========================================="
echo "服务器初始化完成。"
echo "接下来把本机 deploy/keys/baoleme-deploy.pub 的内容"
echo "追加到服务器： ${HOME_DIR}/.ssh/authorized_keys"
echo "然后在 GitHub 仓库配置 Secrets 并 push main。"
echo "域名解析生效后执行："
echo "  apt-get install -y certbot python3-certbot-nginx"
echo "  certbot --nginx -d ${DOMAIN}"
echo "=========================================="
