import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
export default [{
  files: ['src/**/*.ts'],
  languageOptions: { parser },
  plugins: { '@typescript-eslint': tseslint },
  rules: { 'no-unused-vars': 'off', '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] }
}];
