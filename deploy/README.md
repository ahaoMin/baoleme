# 部署说明 · a.baoleme.site

本站是 Vite 静态站（Hash 路由），用 **Nginx 托管 `dist`**。推荐 **GitHub Actions**：push `main` 自动构建并 SCP 到服务器。

## 一、域名与安全组

1. 阿里云 DNS：`a.baoleme.site` → A 记录 → ECS 公网 IP  
2. 安全组放行：`22`（SSH）、`80`（HTTP）、`443`（HTTPS）

## 二、服务器首次初始化（SSH）

把本仓库的 `deploy/` 传到服务器，或 clone 后执行：

```bash
cd deploy
bash setup-server.sh
```

会安装 Nginx，站点目录默认 `/var/www/baoleme`，配置域名 `a.baoleme.site`。

HTTPS（解析生效后）：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d a.baoleme.site
```

## 三、GitHub 仓库与 Secrets

1. 在 GitHub 新建空仓库，本机关联并推送：

```bash
git remote add origin git@github.com:你的用户名/仓库名.git
git add -A
git commit -m "chore: initial commit with deploy pipeline"
git push -u origin main
```

2. 仓库 → **Settings → Secrets and variables → Actions**，添加：

| Secret | 含义 | 示例 |
|--------|------|------|
| `SSH_HOST` | 服务器公网 IP | `47.x.x.x` |
| `SSH_USER` | SSH 用户 | `root` 或 `ubuntu` |
| `SSH_PRIVATE_KEY` | 部署私钥全文 | 见下 |
| `SSH_PORT` | SSH 端口 | `22` |
| `DEPLOY_PATH` | 站点目录 | `/var/www/baoleme` |

> `SSH_PORT`、`DEPLOY_PATH` 也建议配上（不要留空）。

生成部署专用密钥（本机）：

```bash
ssh-keygen -t ed25519 -C "github-deploy-baoleme" -f baoleme-deploy -N ""
```

- 把 `baoleme-deploy.pub` 内容追加到服务器 `~/.ssh/authorized_keys`  
- 把 `baoleme-deploy` **私钥全文**粘进 GitHub Secret `SSH_PRIVATE_KEY`

## 四、日常更新

改代码 → commit → `git push origin main` → Actions 跑完后访问：

https://a.baoleme.site

也可在 Actions 页手动 **Run workflow**。

## 五、首次手动上传（可选）

尚未配 Actions 时，本机：

```bash
npm run build
scp -r dist/* 用户@服务器IP:/var/www/baoleme/
```
