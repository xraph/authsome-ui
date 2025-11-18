/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@authsome/ui-core',
    '@authsome/ui-react',
    '@authsome/ui-react-headless',
    '@authsome/ui-react-shadcn',
    '@authsome/adapter-authsome',
    '@authsome/adapter-supabase',
    '@authsome/adapter-clerk',
    '@authsome/adapter-generic',
  ],
};

module.exports = nextConfig;
