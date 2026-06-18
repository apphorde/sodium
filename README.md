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
      <markdown-block>
        # Hello
      </markdown-block>
    </template>
  </body>
</html>
```
