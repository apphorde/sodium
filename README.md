# sodium

A component library using @li3/web

## Usage

Define an import map in the index.html of your app, to load components via ESM imports:
Now, any `@lithum/*` or `@sodium/*` imports can be used as regular imports.

Then load the components you want to use in your page:

```html
<html>
  <head>
    <link rel="component" href="https://at-sodium.static.apphor.de/code-editor" />
    <link rel="component" href="https://at-sodium.static.apphor.de/markdown-block" />
    <script type="importmap">
      {
        "imports": {
          "@li3/": "https://at-li3.static.apphor.de/"
        }
      }
    </script>
    <script type="module">
      import "@li3/web";
    </script>
  </head>
  <body>
    <template app>
      <code-editor></code-editor>
      <markdown-block></markdown-block>
    </template>
  </body>
</html>
```
