# Deployment Guide

## GitHub Actions Workflow Improvements

### Changes Made

#### 1. **Performance Improvements**
- **NPM Caching**: Added `cache: 'npm'` to the Node.js setup step - this caches `node_modules` between runs, reducing install time from ~2-3 minutes to ~30 seconds
- **Prefer Offline**: Using `npm ci --prefer-offline` to use cached packages when available
- **Latest Actions**: Updated to `actions/setup-node@v4` for better caching support

#### 2. **FTP Connection Fixes**
- **Explicit Protocol**: Added `protocol: ftp` to force plain FTP (not FTPS/SFTP)
- **Standard Port**: Explicitly set `port: 21`
- **Better Timeouts**: Configured timeout and retry settings for both `lftp` and the deploy action
- **Verbose Logging**: Added `log-level: verbose` to help diagnose connection issues

#### 3. **Reliability Enhancements**
- **Continue on Error**: The cleanup step now continues even if the sync file doesn't exist
- **Manual Trigger**: Added `workflow_dispatch` to allow manual deployment runs
- **Better Verification**: Enhanced build output verification with file sizes

#### 4. **Configuration Cleanup**
- Removed `dangerous-clean-slate: false` (explicit safer default)
- Improved exclude patterns
- Increased timeout to 5 minutes for large deployments

## Fixing Your FTP Connection Error

The error `getaddrinfo ENOTFOUND` means the FTP host couldn't be resolved. Here's how to fix it:

### Step 1: Verify Your FTP Host Secret

In your GitHub repository:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Check your `FTPHOST` secret

The value should be **just the hostname**, NOT a full URL:

✅ **Correct formats:**
- `ftp.lugarstore.net`
- `lugarstore.net`
- `123.456.789.012` (IP address)

❌ **Incorrect formats:**
- `ftp://lugarstore.net` (remove protocol)
- `ftp://lugarstore.net:21` (remove port)
- `https://lugarstore.net` (wrong protocol)

### Step 2: Test FTP Credentials Locally

From your terminal, test the connection:

```bash
# Test with lftp
lftp -u your-username,your-password ftp.lugarstore.net -e "set ftp:ssl-allow no; ls; bye"
```

If this fails, contact your hosting provider (Hostinger) to confirm:
- FTP is enabled (not just SFTP)
- The correct FTP hostname
- The FTP port (usually 21)
- Whether SSL/TLS is required

### Step 3: Check if You Need SFTP Instead

Hostinger often uses SFTP (SSH File Transfer Protocol) instead of FTP. If your test above fails, try:

```bash
# Test SFTP
sftp your-username@yourdomain.com
```

If SFTP works, you'll need to use a different GitHub Action. Replace the deploy step with:

```yaml
- name: Deploy via SFTP
  uses: wlixcc/SFTP-Deploy-Action@v1.2.4
  with:
    server: ${{ secrets.FTPHOST }}
    username: ${{ secrets.FTPUSERNAME }}
    password: ${{ secrets.FTPPASSWORD }}
    port: 22  # SFTP uses port 22
    local_path: './dist/lugare-store-admin/browser/*'
    remote_path: '/domains/lugarstore.net/public_html/admin/'
    sftp_only: true
```

### Step 4: Alternative - Use rsync over SSH

For better performance, consider rsync:

```yaml
- name: Deploy via rsync
  uses: burnett01/rsync-deployments@6.0.0
  with:
    switches: -avzr --delete --exclude='.htaccess'
    path: ./dist/lugare-store-admin/browser/
    remote_path: /domains/lugarstore.net/public_html/admin/
    remote_host: ${{ secrets.FTPHOST }}
    remote_user: ${{ secrets.FTPUSERNAME }}
    remote_key: ${{ secrets.SSH_PRIVATE_KEY }}
```

## Expected Performance

With the improvements:

| Stage | Before | After |
|-------|--------|-------|
| Checkout | ~10s | ~10s |
| Node.js Setup | ~15s | ~10s (with cache) |
| Install Dependencies | ~2-3min | ~30-45s (with cache) |
| Build | ~1-2min | ~1-2min |
| Deploy (FTP) | ~3-5min | ~2-3min (with better connection) |
| **Total** | **~7-12min** | **~4-6min** |

## Monitoring Deployments

### View Workflow Runs
1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click on a workflow run to see detailed logs

### Manual Deployment
1. Go to **Actions** tab
2. Select "Deploy Angular to Hostinger" workflow
3. Click **Run workflow** → **Run workflow**

## Troubleshooting

### Build Fails
- Check Node.js version matches local: `node -v`
- Clear cache: Re-run workflow with "Clear cache" option
- Check for build errors in the logs

### FTP Times Out
- Increase timeout in workflow file
- Check if Hostinger has rate limiting
- Consider using SFTP or rsync instead

### Files Not Updating
- Check the `.ftp-deploy-sync-state.json` is being deleted
- Verify `server-dir` path is correct
- Check file permissions on the server

## Security Notes

- Never commit secrets to the repository
- Use GitHub Secrets for all credentials
- Consider using SSH keys instead of passwords
- Regularly rotate FTP/SFTP passwords

## Contact Hostinger Support

If issues persist, contact Hostinger support with these questions:
1. What is the correct FTP hostname for my account?
2. Is FTP enabled or only SFTP?
3. What port should I use (21 for FTP, 22 for SFTP)?
4. Is SSL/TLS required for FTP connections?
5. Are there any IP restrictions or rate limits?
