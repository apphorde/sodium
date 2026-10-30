import { test } from "node:test";
import { strict as assert } from "node:assert";
import { autocompleteToken, replaceAutocomplete } from "./composer-autocomplete.mjs";

test("recognizes mention and channel tokens at the caret", () => {
  assert.deepEqual(autocompleteToken("hello @al!", 9), { trigger: "@", query: "al", start: 6, end: 9 });
  assert.deepEqual(autocompleteToken("#", 1), { trigger: "#", query: "", start: 0, end: 1 });
  assert.equal(autocompleteToken("mail@example", 12), null);
  assert.equal(autocompleteToken("@alice", 3, 4), null);
  assert.equal(autocompleteToken("@alice ", 7), null);
});

test("replaces only the active token", () => {
  const token = autocompleteToken("hi @al there", 6);
  assert.equal(replaceAutocomplete("hi @al there", token, "@alice"), "hi @alice there");
});
