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
          "@li3/": "https://at-li3.static.apphor.de/"
        }
      }
    </script>
    <script type="module">
      import { load } from "@li3/web";

      load("https://at-sodium.static.apphor.de/code-editor");
      load("https://at-sodium.static.apphor.de/select-viewport");
    </script>
  </head>
  <body>
    <template app>
      <select-viewport
        onselect="editor.style.width = viewportMap[event.detail]"
      ></select-viewport>
      <code-editor id="editor"></code-editor>
    </template>
  </body>
</html>
```
