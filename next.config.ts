import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // @ts-ignore - Next.js 16.2.5 accepts this at the root
  allowedDevOrigins: ['172.16.4.106', 'localhost'],
  turbopack: {
    root: path.join(__dirname),
  }
};

export default nextConfig;
