import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unhbvkszwhczbjxgetgk.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.metaforge.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '145.223.116.42',
        port: '9000',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
