import antfu from '@antfu/eslint-config'
import pinia from 'eslint-plugin-pinia'

export default antfu({
  typescript: true,
  markdown: true,
  vue: true,
  yaml: true,
  jsx: false,
  toml: false,
  pnpm: false,
  formatters: {
    css: true,
    prettierOptions: {
      plugins: ['prettier-plugin-css-order'],
    },
  },
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: false,
    overrides: {
      'style/implicit-arrow-linebreak': ['error', 'beside'],
      'style/nonblock-statement-body-position': ['error', 'beside'],
      'style/brace-style': 'error',
      'style/arrow-parens': 'off',
    },
  },
  plugins: {
    pinia,
  },
  rules: {
    // pinia
    ...pinia.configs.recommended.rules,
    'pinia/prefer-single-store-per-file': ['error'],
    'pinia/prefer-use-store-naming-convention': ['error'],

    // syntax
    'no-else-return': 'error',
    'no-nested-ternary': 'error',
    'max-params': ['error', 3],
    'ts/no-unused-expressions': ['error', {
      allowTernary: false,
    }],

    // vue
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 1,
      },
      multiline: {
        max: 1,
      },
    }],
    'vue/block-order': ['error', {
      order: ['template', 'script', 'style'],
    }],
    'vue/first-attribute-linebreak': ['error', {
      singleline: 'beside',
      multiline: 'below',
    }],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/define-props-destructuring': ['error', {
      destructure: 'never',
    }],
    'vue/define-macros-order': ['error', {
      order: [
        'defineOptions',
        'defineProps',
        'defineModel',
        'defineEmits',
        'defineSlots',
      ],
      defineExposeLast: true,
    }],
    'vue/no-required-prop-with-default': 'error',
    'vue/v-on-event-hyphenation': 'error',
    'vue/prefer-true-attribute-shorthand': 'error',
    'vue/require-macro-variable-name': 'error',
    'vue/enforce-style-attribute': ['error', {
      allow: ['scoped', 'plain'],
    }],

    // imports
    'perfectionist/sort-imports': ['error', {
      groups: [
        'builtin',
        'external',
        ['internal', 'internal-type'],
        ['parent', 'sibling', 'index'],

        'type',
        ['parent-type', 'sibling-type', 'index-type'],

        'side-effect',
        'object',
        'unknown',
      ],
      newlinesBetween: 'ignore',
      order: 'asc',
      type: 'natural',
    }],
    'perfectionist/sort-named-imports': [
      'error',
      {
        type: 'alphabetical',
        order: 'asc',
        ignoreCase: true,
      },
    ],

    // off
    'no-alert': 'off',
    'no-console': 'off',
    'no-cond-assign': 'off',
    'no-template-curly-in-string': 'off',
    'antfu/no-top-level-await': 'off',
    'antfu/if-newline': 'off',
    'ts/method-signature-style': 'off',
    'ts/no-redeclare': 'off',
    'ts/consistent-type-definitions': 'off',
    'ts/ban-ts-comment': 'off',
    'ts/no-namespace': 'off',
    'vue/custom-event-name-casing': 'off',
    'regexp/no-super-linear-backtracking': 'off',
    'regexp/no-obscure-range': 'off',
    'eslint-comments/no-unlimited-disable': 'off',
  },
})
