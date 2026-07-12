# 自动部署步骤（GitHub Actions → 阿里云）

域名：`a.baoleme.site`  
站点目录：`/var/www/baoleme`

---

## ① 服务器初始化（SSH 里执行）

本机先传脚本：

```powershell
scp "e:\02-开发项目\饱了吗\deploy\bootstrap-server.sh" root@你的服务器IP:/tmp/
scp "e:\02-开发项目\饱了吗\deploy\keys\baoleme-deploy.pub" root@你的服务器IP:/tmp/
```

服务器上：

```bash
sudo bash /tmp/bootstrap-server.sh
# 若用 root：
mkdir -p ~/.ssh && chmod 700 ~/.ssh
cat /tmp/baoleme-deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

若 SSH 用户是 `ubuntu`，公钥写到 `/home/ubuntu/.ssh/authorized_keys`，Secrets 里 `SSH_USER` 也填 `ubuntu`。

---

## ② GitHub 登录并建仓库（本机）

```powershell
gh auth login
# 选 GitHub.com → HTTPS → Login with browser
```

然后把仓库推上去（仓库名可改）：

```powershell
cd "e:\02-开发项目\饱了吗"
gh repo create baoleme --public --source=. --remote=origin --push
```

（若已有仓库：`git remote add origin ...` 再 `git push -u origin main`）

---

## ③ 配置 Actions Secrets

仓库页 → **Settings → Secrets and variables → Actions** → 新建：

| Secret | 填什么 |
|--------|--------|
| `SSH_HOST` | 服务器公网 IP |
| `SSH_USER` | `root` 或 `ubuntu` |
| `SSH_PRIVATE_KEY` | 打开本机 `deploy\keys\baoleme-deploy`，整份私钥粘贴 |
| `SSH_PORT` | `22` |
| `DEPLOY_PATH` | `/var/www/baoleme` |

私钥文件可用记事本打开，从 `-----BEGIN` 到 `-----END` 全部复制。

---

## ④ 触发部署

```powershell
git push origin main
```

或：GitHub → **Actions** → **Deploy to Aliyun** → **Run workflow**

成功后打开：http://a.baoleme.site  

HTTPS（HTTP 通了再做）：

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d a.baoleme.site
```

---

## 以后日常

改代码 → `git add` / `commit` → `git push` → 自动上线。
