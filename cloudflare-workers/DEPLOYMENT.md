# AI4Bharat Cloudflare Worker Deployment Guide

This guide will help you deploy the AI4Bharat sentiment analysis proxy worker to Cloudflare.

## Prerequisites

1. Cloudflare account (free tier works)
2. Hugging Face API key ([Get one here](https://huggingface.co/settings/tokens))
3. Wrangler CLI (already installed in this project)

## Deployment Steps

### Step 1: Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window to authenticate with Cloudflare.

### Step 2: Deploy the Worker

From the project root directory:

```bash
npx wrangler deploy --config cloudflare-workers/ai4bharat-wrangler.toml
```

After successful deployment, you'll see output like:
```
Published pulse-ai4bharat-proxy (X.XX sec)
  https://pulse-ai4bharat-proxy.<your-subdomain>.workers.dev
```

**IMPORTANT**: Copy the worker URL - you'll need it for the next steps!

### Step 3: Set the Hugging Face API Key as a Secret

Securely store your Hugging Face API key in Cloudflare (NEVER commit this to your repository):

```bash
npx wrangler secret put HUGGINGFACE_API_KEY --config cloudflare-workers/ai4bharat-wrangler.toml
```

When prompted, paste your Hugging Face API key.

### Step 4: Update Frontend Environment Variables

1. Open your `.env` file
2. Update the `VITE_AI4BHARAT_PROXY_URL` with your worker URL:

```env
VITE_AI4BHARAT_PROXY_URL=https://pulse-ai4bharat-proxy.<your-subdomain>.workers.dev
```

3. **IMPORTANT**: Remove or comment out `VITE_HUGGINGFACE_API_KEY` from your `.env` file:

```env
# VITE_HUGGINGFACE_API_KEY=your-key-here  # DO NOT USE - Key is in Cloudflare Worker
```

### Step 5: Restart Development Server

Stop and restart your Vite development server to load the new environment variables:

```bash
# Stop the server (Ctrl+C)
# Start again:
npm run dev
```

## Verification

### Test the Worker Directly

You can test the worker with curl:

```bash
curl -X POST https://pulse-ai4bharat-proxy.<your-subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ai4bharat/IndicBERTv2-MLM-only",
    "inputs": "This is a test [MASK].",
    "options": {
      "wait_for_model": true
    }
  }'
```

You should receive a JSON response with fill-mask predictions.

### Test in Your Application

1. Go to Voter Sentiment Analysis page
2. Make a test call
3. Check browser console for `[AI4Bharat]` logs
4. You should see "Analyzing sentiment with IndicBERTv2 via proxy"
5. No CORS errors should appear!

## Troubleshooting

### Error: "Hugging Face API key not configured"

**Solution**: Make sure you ran Step 3 to set the secret:
```bash
npx wrangler secret put HUGGINGFACE_API_KEY --config cloudflare-workers/ai4bharat-wrangler.toml
```

### Error: "AI4Bharat proxy URL not configured"

**Solution**: Update your `.env` file with the correct worker URL from Step 2.

### CORS errors still appearing

**Solution**:
1. Verify worker is deployed: `npx wrangler deployments list --config cloudflare-workers/ai4bharat-wrangler.toml`
2. Check that `.env` has correct proxy URL
3. Restart development server

### Worker takes long time (>10s)

**Cause**: Hugging Face model is "cold starting" (loading into memory)

**Solutions**:
- First request to a model takes ~20-30 seconds
- Subsequent requests will be fast (~2-3 seconds)
- Consider using a popular model that's already "warm"
- Or wait for model to load on first request

## Monitoring

View worker logs in real-time:

```bash
npx wrangler tail --config cloudflare-workers/ai4bharat-wrangler.toml
```

This will show all console.log() output and errors from the worker.

## Updating the Worker

After making changes to `cloudflare-workers/ai4bharat-proxy.js`:

```bash
npx wrangler deploy --config cloudflare-workers/ai4bharat-wrangler.toml
```

Changes are deployed instantly!

## Cost & Limits

Cloudflare Workers Free Tier:
- ✅ 100,000 requests/day
- ✅ 10ms CPU time per request (we use 100ms, still plenty)
- ✅ Unlimited bandwidth

For typical usage (5-10 sentiment analyses per minute), the free tier is MORE than sufficient!

## Custom Domain (Optional)

If you want to use a custom domain like `api.pulseofpeople.com/ai`:

1. Add route in `cloudflare-workers/ai4bharat-wrangler.toml`:
```toml
[[routes]]
pattern = "api.pulseofpeople.com/ai"
zone_name = "pulseofpeople.com"
```

2. Update `.env`:
```env
VITE_AI4BHARAT_PROXY_URL=https://api.pulseofpeople.com/ai
```

3. Redeploy:
```bash
npx wrangler deploy --config cloudflare-workers/ai4bharat-wrangler.toml
```

## Security Notes

✅ **GOOD**: Hugging Face API key is stored as Cloudflare Worker secret (not in code)
✅ **GOOD**: CORS headers configured to allow frontend calls
✅ **GOOD**: No API key exposed in browser
⚠️ **NOTE**: Worker URL is public, but that's okay - it only proxies AI requests

## Support

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- Wrangler CLI Docs: https://developers.cloudflare.com/workers/wrangler/
- Hugging Face Inference API: https://huggingface.co/docs/api-inference/
