# sodium

A component library using @li3/web

## Usage

Define an import map in the index.html of your app, to load components via ESM imports:
Now, any `@lithum/*` or `@sodium/*` imports can be used as regular imports.

Then load the components you want to use in your page:

```html
<html>
  <head>
    <link rel="component" href="https://sodium.static.apphor.de/lucide-icon.html" />
    <link rel="component" href="https://sodium.static.apphor.de/markdown-block.html" />
    <script type="importmap">
      {
        "imports": {
          "@li3/": "https://cdn.li3.dev/@li3/"
          "@sodium/": "https://sodium.static.apphor.de/",
        }
      }
    </script>
    <script type="module">
      import "@li3/web";
    </script>
  </head>
  <body>
    <template app>
      <lucide-icon icon="globe" size="32"></lucide-icon>
      <markdown-block> # Hello </markdown-block>
    </template>
  </body>
</html>
```

### Code editor composer options

The editor retains its existing code-editing behavior by default. Set `wrap` to a truthy value to enable soft wrapping in both the input and highlighted preview. For best line-number alignment with wrapped text, also set `nolines`.

Supply an `autocomplete` function prop to enable suggestions for `@` and `#` tokens at the caret. It receives `{ trigger, query, start, end, value }` and returns (or resolves to) an array of `{ label, value }` objects. `value` is the complete replacement text, including any desired trigger or trailing space. The host owns filtering and data access. Arrow keys select an option, Enter or Tab inserts it, and Escape dismisses the list. Shift+Enter inserts a newline even while suggestions are open. Selection emits the existing `change` event. Stale asynchronous results are ignored. Set the `label` prop to give the input an accessible name appropriate to its use (default: `Code editor`).
