import { defineConfig } from '@dumbbell/stsc';

const createConfig = async () => {
  return defineConfig({
    schemaFile: './lc-config/schema1.json',
    assetsFile: './lc-config/assets.json',
    entryHtmlFile: './index.html',
    npmClient: 'rush',
    // assetsFile: 'https://alifd.alicdn.com/npm/@alilc/lowcode-materials@1.0.0/dist/assets.json',
  });
};
export default createConfig;
