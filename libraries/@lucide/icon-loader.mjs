let ce;

export async function createElement(name) {
  if (!ce) {
    const mod = await import(
      "https://unpkg.com/lucide@latest/dist/esm/createElement.js"
    );
    ce = mod.default;
  }

  return ce(name);
}

export async function loadIcon(name) {
  try {
    const mod = await import(
      `https://unpkg.com/lucide@latest/dist/esm/icons/${name}.mjs`
    );
    const icon = mod.default;
    return createElement(icon);
  } catch {
    throw new Error("Icon not found: " + name);
  }
}
