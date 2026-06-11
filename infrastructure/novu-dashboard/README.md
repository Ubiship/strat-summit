# UbiShip Novu Dashboard

White-labeled Novu dashboard with UbiShip branding.

## Deployment

### Option 1: Update existing Railway service

1. Link to the novu-dashboard service:
   ```bash
   cd infrastructure/novu-dashboard
   railway link -s novu-dashboard
   ```

2. Deploy:
   ```bash
   railway up
   ```

### Option 2: Manual via Railway Dashboard

1. Go to the `novu-dashboard` service in Railway
2. Change source from Docker Image to GitHub repo
3. Set root directory to `infrastructure/novu-dashboard`
4. Deploy

## Files

- `Dockerfile` - Extends `ghcr.io/novuhq/novu/web:latest` with CSS injection
- `ubiship-theme.css` - UbiShip brand styling
- `railway.json` - Railway deployment config

## Updating the theme

Edit `ubiship-theme.css` and redeploy:
```bash
railway up
```
