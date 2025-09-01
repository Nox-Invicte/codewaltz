import WebpackObfuscator from 'webpack-obfuscator';
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  turbopack: {
    // Enable Turbopack with default settings
    // You can add specific options here if needed, e.g., rules, loaders, etc.
  },
  productionBrowserSourceMaps: false,
  webpack(config: Configuration, { isServer }: { isServer: boolean }) {
    if (!isServer) {
      if (!config.plugins) {
        config.plugins = [];
      }
      config.plugins.push(
        new WebpackObfuscator(
          {
            rotateStringArray: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.75,
          },
          []
        )
      );
    }
    return config;
  },
};

export default nextConfig;
