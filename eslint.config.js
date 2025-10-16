const typescriptEslintParser = require('@typescript-eslint/parser');
const n8nNodesBase = require('eslint-plugin-n8n-nodes-base');

module.exports = [
	{
		files: ['**/*.ts'],
		ignores: ['dist/**', 'node_modules/**', '*.js'],
		languageOptions: {
			parser: typescriptEslintParser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: 'module',
				project: './tsconfig.json',
			},
		},
		plugins: {
			'n8n-nodes-base': n8nNodesBase,
		},
		rules: {
			'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'error',
			'n8n-nodes-base/node-class-description-outputs-wrong': 'error',
			'n8n-nodes-base/node-dirname-against-convention': 'error',
			'n8n-nodes-base/node-execute-block-wrong-error-thrown': 'error',
			'n8n-nodes-base/node-param-default-missing': 'error',
			'n8n-nodes-base/node-param-description-boolean-without-whether': 'warn',
			'n8n-nodes-base/node-param-display-name-excess-inner-whitespace': 'error',
			'n8n-nodes-base/node-param-display-name-miscased': 'error',
			'n8n-nodes-base/node-param-display-name-not-first-position': 'error',
			'n8n-nodes-base/node-param-display-name-untrimmed': 'error',
			'n8n-nodes-base/node-param-display-name-wrong-for-dynamic-multi-options': 'error',
			'n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options': 'error',
			'n8n-nodes-base/node-param-display-name-wrong-for-simplify': 'error',
			'n8n-nodes-base/node-param-display-name-wrong-for-update-fields': 'error',
			'n8n-nodes-base/node-param-min-value-wrong-for-limit': 'error',
			'n8n-nodes-base/node-param-multi-options-type-unsorted-items': 'warn',
			'n8n-nodes-base/node-param-operation-without-no-data-expression': 'error',
			'n8n-nodes-base/node-param-option-description-identical-to-name': 'error',
			'n8n-nodes-base/node-param-option-name-containing-star': 'error',
			'n8n-nodes-base/node-param-option-name-duplicate': 'error',
			'n8n-nodes-base/node-param-option-name-wrong-for-get-many': 'error',
			'n8n-nodes-base/node-param-option-name-wrong-for-upsert': 'error',
			'n8n-nodes-base/node-param-options-type-unsorted-items': 'warn',
			'n8n-nodes-base/node-param-resource-without-no-data-expression': 'error',
			'n8n-nodes-base/node-param-type-options-missing-from-limit': 'error',
		},
	},
];
