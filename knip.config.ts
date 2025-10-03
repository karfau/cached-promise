import type {KnipConfig} from 'knip';

const config: KnipConfig = {
  entry: ['eslint.config.js'],
  // project: ['src/**/*.ts'],
  'github-actions': {},
  // eslint: {config: 'eslint.config.js'},
  // prettier: {config: '.prettierrc.json'},
  ignoreDependencies: ['jsr', 'release-please'],
};

export default config;
