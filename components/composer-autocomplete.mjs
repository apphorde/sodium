// Return the token immediately before a collapsed caret, at a word boundary.
export function autocompleteToken(value, start, end = start) {
  if (start !== end) {
    return null;
  }
  const match = /(?:^|\s)([@#])([^\s@#]*)$/.exec(value.slice(0, start));
  if (!match) {
    return null;
  }
  return { trigger: match[1], query: match[2], start: start - match[2].length - 1, end: start };
}

export function replaceAutocomplete(value, token, replacement) {
  return value.slice(0, token.start) + replacement + value.slice(token.end);
}
