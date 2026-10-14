// Token enforcement for src/**/*.css. Run with `pnpm lint:css`.
// tokens.css is the token source, so it is the one file allowed raw values.

const COLOUR_PROP_NAMES =
  '(color|background|background-color|border|border-(top|right|bottom|left|block|inline)(-(start|end))?|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?-color|outline|outline-color|fill|stroke|box-shadow|caret-color|text-decoration-color|column-rule-color)';
const COLOUR_PROPS = `/^${COLOUR_PROP_NAMES}$/`;

const RAW_COLOUR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\((?!\s*var\()/i;

export default {
  plugins: [
    'stylelint-declaration-strict-value',
    'stylelint-value-no-unknown-custom-properties',
  ],
  // Lint only src/, and never the token source.
  ignoreFiles: ['**/*', '.*/**', '!src/**', 'src/styles/tokens.css', 'src/dev/**', 'src/prototype/**'],
  rules: {
    // Raw colours (hex, rgb/rgba, hsl/hsla) in colour properties are errors.
    // Raw palette tokens (--neutral-*, --primary-*, --secondary-*) only warn: they
    // don't flip in dark mode, but status icon colours use them on purpose.
    'declaration-property-value-disallowed-list': [
      {
        [COLOUR_PROPS]: [
          '/#[0-9a-fA-F]{3,8}\\b/',
          '/\\b(rgba?|hsla?)\\((?!\\s*var\\()/i',
          '/var\\(--(neutral|primary|secondary)-[0-9]/',
        ],
        // Font sizes must come from the --font-size-* scale.
        'font-size': ['/var\\(--(?!font-size-)/'],
      },
      {
        message: (prop, value) =>
          prop === 'font-size'
            ? `font-size "${value}" must use var(--font-size-*)`
            : RAW_COLOUR.test(value)
              ? `Raw colour in "${prop}: ${value}" - use a var(--token)`
              : `Raw palette token in "${prop}: ${value}" does not flip in dark mode - prefer a semantic token`,
        severity: (prop, value) =>
          prop !== 'font-size' && !RAW_COLOUR.test(value) ? 'warning' : 'error',
      },
    ],
    // Named colours (red, white, ...) in colour properties. transparent/currentColor are allowed.
    'color-named': ['never', { ignoreProperties: [`/^(?!${COLOUR_PROP_NAMES}$)/`] }],
    // Raw font sizes: must be a variable (or inherit).
    'scale-unlimited/declaration-strict-value': [
      ['font-size'],
      { ignoreValues: ['inherit'], ignoreFunctions: false },
    ],
    // Every var(--x) must exist in tokens.css or be declared in the same file.
    'csstools/value-no-unknown-custom-properties': [
      true,
      { importFrom: ['src/styles/tokens.css'], severity: 'warning' },
    ],
  },
};
