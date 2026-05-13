/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**.supabase.co' }] },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      canvas: false,
      'konva$': 'konva/lib/index.js',
      'konva/lib/index-node.js': 'konva/lib/index.js'
    };
    return config;
  }
};

export default nextConfig;
