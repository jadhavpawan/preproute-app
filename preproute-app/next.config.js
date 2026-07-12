/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Any request the browser makes to /api/* on OUR OWN domain gets
        // forwarded server-to-server (by Next.js, not the browser) to the
        // real backend. Because the browser only ever talks to our own
        // origin, there is no cross-origin request and therefore no CORS
        // preflight/check to fail — sidesteps needing the backend's CORS
        // config to list our Vercel domain at all.
        source: "/api/:path*",
        destination:
          "https://admin-moderator-backend-staging.up.railway.app/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
