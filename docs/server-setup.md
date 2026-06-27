# Storybook Server Setup

Step-by-step guide to set up an Nginx server to host the RP Platform Storybook.
At the bottom: how to migrate to AWS S3 + CloudFront when you're ready.

---

## Prerequisites

- A VPS or dedicated server running Ubuntu 22.04 (or similar Debian-based distro)
- SSH access with a user that has `sudo` rights
- A domain or subdomain pointing to your server IP (e.g. `storybook.yourcompany.com`)

---

## Step 1 — Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## Step 2 — Create the web root directory

```bash
sudo mkdir -p /var/www/rp-storybook
sudo chown -R $USER:$USER /var/www/rp-storybook
```

---

## Step 3 — Configure Nginx virtual host

Create a new config file:

```bash
sudo nano /etc/nginx/sites-available/rp-storybook
```

Paste this content (replace `storybook.yourcompany.com` with your actual domain):

```nginx
server {
    listen 80;
    server_name storybook.yourcompany.com;

    root /var/www/rp-storybook;
    index index.html;

    # SPA routing — serve index.html for any unknown path
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively (Storybook outputs hashed filenames)
    location ~* \.(js|css|png|jpg|ico|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/rp-storybook /etc/nginx/sites-enabled/
sudo nginx -t          # verify config is valid
sudo systemctl reload nginx
```

---

## Step 4 — Set up SSH key for GitHub Actions

On your server, create a dedicated deploy user (optional but recommended):

```bash
sudo adduser deploy --disabled-password --gecos ""
sudo usermod -aG sudo deploy
```

Generate an SSH key pair (on your local machine):

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/rp_deploy
# Creates: ~/.ssh/rp_deploy (private) and ~/.ssh/rp_deploy.pub (public)
```

Copy the public key to the server:

```bash
ssh-copy-id -i ~/.ssh/rp_deploy.pub deploy@YOUR_SERVER_IP
```

Allow the deploy user to reload Nginx without a password prompt:

```bash
sudo visudo
# Add this line at the bottom:
deploy ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
```

---

## Step 5 — Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add these four secrets:

| Secret name | Value |
|---|---|
| `SSH_HOST` | Your server IP address (e.g. `192.168.1.100`) |
| `SSH_USER` | The deploy user (e.g. `deploy`) |
| `SSH_PRIVATE_KEY` | Contents of `~/.ssh/rp_deploy` (the private key file — the whole text including `-----BEGIN...-----END` lines) |
| `SSH_TARGET_PATH` | `/var/www/rp-storybook` |

---

## Step 6 — Add HTTPS with Let's Encrypt (recommended)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d storybook.yourcompany.com
# Follow prompts — certbot auto-updates the Nginx config for HTTPS
sudo systemctl reload nginx
```

Certbot auto-renews the certificate. Test renewal:

```bash
sudo certbot renew --dry-run
```

---

## Step 7 — First deploy

Push to `master` on GitHub — the `storybook.yml` workflow will trigger automatically and deploy to your server.

To trigger manually: GitHub repo → **Actions** → **Deploy Storybook** → **Run workflow**.

Your Storybook will be live at: **https://storybook.yourcompany.com**

Update the Storybook URL in `libs/shared/ui/README.md` once it's live.

---

## Migrating to AWS (when you're ready)

When development is complete and you want to move to production infrastructure, the build step stays identical. Only the deploy step changes.

### What changes in `storybook.yml`

Replace the two SSH steps:

```yaml
# REMOVE these two steps:
- name: Deploy to server via SSH
  uses: appleboy/scp-action@v0.1.7
  ...
- name: Reload Nginx
  uses: appleboy/ssh-action@v1.0.3
  ...

# ADD this step instead:
- name: Deploy to S3
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_REGION: ap-southeast-1
  run: |
    aws s3 sync dist/storybook/ui/ s3://your-storybook-bucket/ \
      --delete \
      --cache-control "public, max-age=31536000, immutable" \
      --exclude "index.html"
    aws s3 cp dist/storybook/ui/index.html s3://your-storybook-bucket/index.html \
      --cache-control "no-cache"
    aws cloudfront create-invalidation \
      --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
      --paths "/*"
```

### AWS secrets to add

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key (S3 + CloudFront permissions) |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `CLOUDFRONT_DISTRIBUTION_ID` | Your CloudFront distribution ID |

### AWS setup checklist

1. Create an S3 bucket (e.g. `rp-storybook`) — enable static website hosting
2. Create a CloudFront distribution pointing to the S3 bucket
3. Set the default root object to `index.html`
4. Set error page 403/404 → `/index.html` (SPA routing)
5. Create an IAM user with `s3:PutObject`, `s3:DeleteObject`, `cloudfront:CreateInvalidation` permissions
6. Add the GitHub secrets above

That's a 5-line change in the workflow file — nothing else in the codebase needs to change.
