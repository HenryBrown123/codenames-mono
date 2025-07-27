/**
 * Combines class names, filtering out falsy values
 */
export const cx = (...classes: (string | undefined | false | null)[]) => 
  classes.filter(Boolean).join(' ');