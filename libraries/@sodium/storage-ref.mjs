import { ref } from "@lithium/reactive";

function storageRef(type, name, initialValue) {
  const backend = type === "session" ? sessionStorage : localStorage;
  const key = `$ref$${name}`;
  const previousValue = backend.getItem(key);
  const $ = ref(undefined, () => {
    const v = JSON.stringify($.value);

    if (backend.getItem(key) !== v) {
      backend.setItem(key, v);
    }
  });

  if (previousValue) {
    $.value = safeParse(previousValue);
  }

  if ($.value === null) {
    $.value = initialValue;
  }

  return $;
}

function safeParse(v) {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

export function localStorageRef(name, initialValue) {
  return storageRef("local", name, initialValue);
}

export function sessionStorageRef(name, initialValue) {
  return storageRef("session", name, initialValue);
}
