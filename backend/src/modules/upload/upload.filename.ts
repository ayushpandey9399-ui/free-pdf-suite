/**
 * File name sanitiser.
 * Responsibility: turn an untrusted client file name into something safe to store in a
 * record, print in a log and echo back over HTTP. Path traversal, control characters and
 * unbounded length are all removed here, once, so no other module has to be careful.
 */

const MAX_NAME_LENGTH = 128;
const UNSAFE_CHARACTERS = /[^A-Za-z0-9._-]+/g;
const LEADING_DOTS = /^\.+/;

/** Sanitise a declared upload name. Always returns a non empty, extension preserving name. */
export function sanitizeFileName(declaredName: string, fallback = 'file'): string {
  // Strip any directory component from both POSIX and Windows style paths.
  const base = declaredName.split(/[\\/]/).pop() ?? '';
  const withoutControl = [...base].filter((character) => character.charCodeAt(0) > 0x1f).join('');
  const collapsed = withoutControl.replace(UNSAFE_CHARACTERS, '_').replace(LEADING_DOTS, '');

  if (collapsed.length === 0) return fallback;
  if (collapsed.length <= MAX_NAME_LENGTH) return collapsed;

  const dotIndex = collapsed.lastIndexOf('.');
  if (dotIndex <= 0 || collapsed.length - dotIndex > 12) {
    return collapsed.slice(0, MAX_NAME_LENGTH);
  }
  const extension = collapsed.slice(dotIndex);
  return collapsed.slice(0, MAX_NAME_LENGTH - extension.length) + extension;
}

/** Replace the extension of a sanitised name, used when producing outputs. */
export function withExtension(name: string, extension: string): string {
  const normalized = extension.startsWith('.') ? extension : `.${extension}`;
  const dotIndex = name.lastIndexOf('.');
  const stem = dotIndex > 0 ? name.slice(0, dotIndex) : name;
  return `${stem}${normalized}`;
}
