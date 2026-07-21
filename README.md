# imprintID Apps — Landing Page

Static tools hub for [imprintID](https://www.imprintid.com/), organized by category with clickable tool cards. Built for AWS static hosting (S3 + CloudFront, or Amplify).

## Local preview

```bash
npm start
```

Open http://localhost:4173

## Add / edit tools

Edit `public/data/tools.json`:

```json
{
  "id": "shipping",
  "name": "Shipping Tools",
  "description": "…",
  "accent": "blue",
  "tools": [
    {
      "name": "Label Generator",
      "description": "Create shipping labels",
      "href": "https://your-tool-url.example",
      "status": "live"
    }
  ]
}
```

- `href: "#"` or `status: "coming-soon"` → card shows as Coming soon (not clickable)
- `status: "live"` + real URL → opens in a new tab

## Deploy to AWS (S3 + CloudFront)

Prerequisites: [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configured.

```bash
chmod +x scripts/deploy.sh

# 1) Create bucket + CloudFront
./scripts/deploy.sh bootstrap

# 2) Upload site + invalidate CDN
./scripts/deploy.sh sync

# Or both:
./scripts/deploy.sh all
```

Optional custom domain:

```bash
DOMAIN_NAME=apps.imprintid.com \
ACM_CERT_ARN=arn:aws:acm:us-east-1:ACCOUNT:certificate/ID \
./scripts/deploy.sh bootstrap
```

Then point DNS (Route 53 or your registrar) CNAME/ALIAS to the CloudFront domain from stack outputs.

## Amplify Hosting (alternative)

1. Connect this repo in AWS Amplify Hosting  
2. Amplify uses `amplify.yml` and publishes the `public/` folder  
3. Add a custom domain in the Amplify console if needed  

## Brand assets

Logos pulled from imprintID CDN (`logo.png`, header banner) live in `public/assets/`. Brand colors: charcoal `#2E2F2E`, blue `#5B94C2`, gold `#DFAC51`.
