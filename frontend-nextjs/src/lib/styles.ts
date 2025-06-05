// Common layout utilities and patterns
export const GRID_LAYOUTS = {
  single: 'grid grid-cols-1 gap-6',
  twoCol: 'grid grid-cols-1 gap-6 sm:grid-cols-2',
  threeCol: 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
  fourCol: 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4',
  responsive: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  responsiveFilters: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-4',
  responsiveOrderFilters: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4',
} as const;

export const SPACING = {
  section: 'mb-6',
  header: 'mb-4',
  content: 'mb-2',
  button: 'mt-4',
  form: 'mt-6',
} as const;

export const CONTAINER = {
  maxWidth: 'max-w-7xl mx-auto',
  padding: 'px-4 sm:px-6 lg:px-8',
  section: 'px-4 py-6 sm:px-0',
} as const;

export const FLEX = {
  between: 'flex justify-between items-center',
  center: 'flex justify-center items-center',
  spaceBetween: 'flex justify-between',
  spaceAround: 'flex justify-around',
  wrap: 'flex flex-wrap gap-2',
  column: 'flex flex-col',
} as const;

export const TEXT = {
  heading1: 'text-3xl font-bold text-gray-900',
  heading2: 'text-2xl font-bold text-gray-900',
  heading3: 'text-lg font-medium text-gray-900',
  heading4: 'text-sm font-medium text-gray-900',
  body: 'text-gray-600',
  small: 'text-sm text-gray-600',
  error: 'text-red-700',
} as const;

export const TRANSITIONS = {
  default: 'transition-colors duration-200',
  fast: 'transition-colors duration-150',
  slow: 'transition-colors duration-300',
} as const;

// Utility function to combine class names
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};