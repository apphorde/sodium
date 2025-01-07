# sodium

A component library using @li3/web

## Usage

Define an import map in the index.html of your app, to load components via ESM imports:
Now, any `@lithum/*` or `@sodium/*` imports can be used as regular imports.

Then load the components you want to use in your page:

```html
<html>
  <head>
    <script type="importmap">
      {
        "imports": {
          "@li3/": "https://--lithium.static.apphor.de/",
          "@sodium/": "https://--sodium.static.apphor.de/",
        }
      }
    </script>
    <script type="module">
      import '@sodium/code-editor';
      import '@sodium/select-viewport';

      window.viewportMap = {
        desktop: "100%",
        tablet: "1024px",
        mobile: "640px",
      }
    </script>
  </head>
  <body>
    <select-viewport onselect="editor.style.width = window.viewportMap[event.detail]"></select-viewport>
    <code-editor id="editor"></code-editor>
  </body>
</html>
```
