/**
 * Cloudflare Workers - AI4Bharat Sentiment Analysis Proxy
 * Proxies requests to Hugging Face Inference API to bypass CORS
 *
 * Deploy with: wrangler deploy --config cloudflare-workers/ai4bharat-wrangler.toml
 */

/**
 * Get CORS headers
 */
function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 2000) {
  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Proxy request to Hugging Face Inference API
 */
async function proxyToHuggingFace(request, env) {
  // Parse request body
  const body = await request.json();
  const { model, inputs, options } = body;

  if (!model) {
    return new Response(JSON.stringify({
      error: 'Missing model parameter',
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders()
      },
    });
  }

  if (!inputs) {
    return new Response(JSON.stringify({
      error: 'Missing inputs parameter',
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders()
      },
    });
  }

  // Validate API key exists
  if (!env.HUGGINGFACE_API_KEY) {
    return new Response(JSON.stringify({
      error: 'Hugging Face API key not configured',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders()
      },
    });
  }

  const startTime = Date.now();

  try {
    // Make request to Hugging Face with retry logic
    const result = await retryWithBackoff(async () => {
      const response = await fetch(
        `https://router.huggingface.co/hf-inference/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs,
            options: {
              wait_for_model: true,
              use_cache: false,
              ...options,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
      }

      return await response.json();
    });

    const duration = Date.now() - startTime;

    console.log(`[AI4Bharat] Successfully processed request in ${duration}ms`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Response-Time': `${duration}ms`,
        ...getCORSHeaders(),
      },
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('[AI4Bharat] Proxy error:', error);

    return new Response(JSON.stringify({
      error: 'Failed to fetch from Hugging Face API',
      message: error.message,
      duration: `${duration}ms`,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCORSHeaders()
      },
    });
  }
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: getCORSHeaders()
        });
      }

      // Only allow POST requests
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({
          error: 'Method not allowed',
          message: 'Only POST requests are supported',
        }), {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            ...getCORSHeaders(),
          },
        });
      }

      // Proxy to Hugging Face (already has CORS headers)
      return await proxyToHuggingFace(request, env);

    } catch (error) {
      console.error('[AI4Bharat] Handler error:', error);

      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCORSHeaders(),
        },
      });
    }
  },
};
