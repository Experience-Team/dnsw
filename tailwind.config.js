/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Replace default palette entirely — use only our design system tokens
    colors: {
      inherit: 'inherit',
      current: 'currentColor',
      transparent: 'transparent',
      white: '#ffffff',
      black: '#000000',

      // ── Blues — Sydney default, overridden to green in NSW theme ────────────
      'blue-100': 'rgb(var(--blue-100-rgb) / <alpha-value>)',
      'blue-90':  'rgb(var(--blue-90-rgb)  / <alpha-value>)',
      'blue-80':  'rgb(var(--blue-80-rgb)  / <alpha-value>)',
      'blue-70':  'rgb(var(--blue-70-rgb)  / <alpha-value>)',
      'blue-60':  'rgb(var(--blue-60-rgb)  / <alpha-value>)',
      'blue-50':  'rgb(var(--blue-50-rgb)  / <alpha-value>)',
      'blue-40':  'rgb(var(--blue-40-rgb)  / <alpha-value>)',
      'blue-30':  'rgb(var(--blue-30-rgb)  / <alpha-value>)',
      'blue-20':  'rgb(var(--blue-20-rgb)  / <alpha-value>)',
      'blue-10':  'rgb(var(--blue-10-rgb)  / <alpha-value>)',

      // ── Greens — NSW use only ────────────────────────────────────────────
      'green-100': '#002E17',
      'green-90':  '#014533',
      'green-80':  '#00563C',
      'green-70':  '#05684A',
      'green-60':  '#16835B',
      'green-50':  '#04A069',
      'green-40':  '#52C290',
      'green-30':  '#A8DEBD',
      'green-20':  '#CFEDD9',
      'green-10':  '#F0FAF2',

      // ── Greys ────────────────────────────────────────────────────────────
      'grey-100': '#0D0D0D',
      'grey-90':  '#1B1B1B',
      'grey-80':  '#363636',
      'grey-70':  '#515151',
      'grey-60':  '#757575',
      'grey-50':  '#969696',
      'grey-40':  '#AFAFAF',
      'grey-30':  '#D1D0D0',
      'grey-20':  '#EBEBEB',
      'grey-10':  '#FAFAFA',

      // ── Purple ───────────────────────────────────────────────────────────
      'purple-100': '#200833',
      'purple-90':  '#3D006B',
      'purple-80':  '#590096',
      'purple-70':  '#7D00D1',
      'purple-60':  '#A126FF',
      'purple-50':  '#C26EFF',
      'purple-40':  '#D69CFF',
      'purple-30':  '#E8C4FF',
      'purple-20':  '#F2DEFF',
      'purple-10':  '#FAF5FF',

      // ── Yellow ───────────────────────────────────────────────────────────
      'yellow-100': '#332600',
      'yellow-90':  '#524000',
      'yellow-80':  '#7A5E00',
      'yellow-70':  '#AD8700',
      'yellow-60':  '#E5B200',
      'yellow-50':  '#FFD400',
      'yellow-40':  '#FFE56F',
      'yellow-30':  '#FFEFB3',
      'yellow-20':  '#FFF8DD',
      'yellow-10':  '#FFFCF5',

      // ── Orange ───────────────────────────────────────────────────────────
      'orange-100': '#401A00',
      'orange-90':  '#6B2900',
      'orange-80':  '#993B00',
      'orange-70':  '#BF4D00',
      'orange-60':  '#ED5E00',
      'orange-50':  '#FF6D0C',
      'orange-40':  '#FF8A30',
      'orange-30':  '#FFB277',
      'orange-20':  '#FFD9BC',
      'orange-10':  '#FFF3ED',

      // ── Red ──────────────────────────────────────────────────────────────
      'red-100': '#470012',
      'red-90':  '#700024',
      'red-80':  '#A10036',
      'red-70':  '#D10047',
      'red-60':  '#FA0057',
      'red-50':  '#FF4269',
      'red-40':  '#FF6B7D',
      'red-30':  '#FFA1A6',
      'red-20':  '#FFCFCF',
      'red-10':  '#FCEDED',

      // ── Accent ───────────────────────────────────────────────────────────
      'accent': '#FF4D25',
    },
    extend: {
      fontFamily: {
        sans: ['"PT Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
