import hljs from "https://unpkg.com/@highlightjs/cdn-assets@11.11.1/es/highlight.min.js";
import {
  watch,
  templateRef,
  defineEvent,
  defineProp,
  onUpdate as onUpdateProp,
  onInit,
} from "@li3/web";

const NEWLINE = "\n";
const SPACE = " ";
const SPACES = "  ";

function debounce(fn, time = 200) {
  let t = 0;

  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), time);
  };
}

function findIndentation(string) {
  let cursor = 0;

  while (cursor < string.length) {
    if (string.charAt(cursor) !== SPACE) break;
    cursor++;
  }

  return cursor;
}

export default function () {
  defineProp("name");
  const valueProp = defineProp("value");
  const language = defineProp("language");
  const readonly = defineProp("readonly");
  const onChange = defineEvent("change");
  const preview = templateRef("preview").value;
  const sourceRef = templateRef("sourceRef").value;
  const cursor = templateRef("cursor").value;
  const lineNumbers = templateRef("lines").value;

  function onSetLanguage() {
    const v = prompt("language", language.value);
    if (v) {
      language.value = v;
    }
  }

  function setSource(s) {
    valueProp.value = s;
  }

  function updatePreview() {
    const code = sourceRef.value + NEWLINE;
    const hl = hljs.highlight(code, {
      language: language.value || "javascript",
      ignoreIllegals: true,
    });

    preview.innerHTML = hl.value;
    lineNumbers.innerHTML = Array(countChars(code, NEWLINE) || 1)
      .fill("<span></span>")
      .join("");

    updatePosition();
  }

  function countChars(str, char) {
    const max = str.length;
    let count = 0;
    let i = 0;

    while (i < max) {
      if (str[i++] === char) count++;
    }

    return count;
  }

  function insertString(string) {
    const start = sourceRef.selectionStart;
    const position = start + string.length;
    const code = valueProp.value;
    const beforeBlock = code.slice(0, start);
    const afterBlock = code.slice(start);
    setSource(beforeBlock + string + afterBlock);
    updateSelection(position, position);
    onUpdate();
  }

  const updatePosition = debounce(function updatePosition() {
    const start = sourceRef.selectionStart;
    const end = sourceRef.selectionEnd;
    const code = sourceRef.value;
    const before = code.slice(0, start);
    const selection = code.slice(start, end);
    const positionLine = before.split(NEWLINE).length;
    const positionColumn = start - before.lastIndexOf(NEWLINE);
    const positionSelection = countChars(selection, NEWLINE) || 0;

    cursor.innerText = `${positionLine}:${positionColumn} (${positionSelection})`;
  }, 20);

  function moveCodeBlock(event) {
    const { target, shiftKey } = event;
    const code = valueProp.value;
    let start = target.selectionStart;
    const end = target.selectionEnd;

    if (start > 0 && code.charAt(start - 1) !== NEWLINE) {
      start = code.slice(0, start).lastIndexOf(NEWLINE);
    }

    const beforeBlock = code.slice(0, start);
    const afterBlock = code.slice(end);
    const selection = code.slice(start, end);
    const lines = selection.split(NEWLINE);
    const modifiedBlock = lines
      .map((line) => (shiftKey ? line.replace(SPACES, "") : SPACES + line))
      .join(NEWLINE);

    setSource(beforeBlock + modifiedBlock + afterBlock);
    updateSelection(start, start + modifiedBlock.length);
    onUpdate();
  }

  function moveCodeLine(event) {
    const { target, shiftKey } = event;
    const code = valueProp.value;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const left = code.slice(0, start);
    const right = code.slice(end);
    const lines = right.split(NEWLINE);
    const line = lines.shift() || "";
    const updatedLine = shiftKey ? line.replace(SPACES, "") : SPACES + line;
    const newSource = left + [updatedLine, ...lines].join(NEWLINE);
    const cursorPosition = shiftKey
      ? start - SPACES.length
      : start + SPACES.length;

    setSource(newSource);
    updateSelection(cursorPosition, cursorPosition);
    onUpdate();
  }

  function updateSelection(start, end) {
    sourceRef.selectionEnd = start;
    sourceRef.selectionStart = end;
  }

  function onTab(event) {
    const { target } = event;
    if (target.selectionStart !== target.selectionEnd) {
      moveCodeBlock(event);
      return;
    }

    moveCodeLine(event);
  }

  function onEnter() {
    const code = valueProp.value;
    const position = sourceRef.selectionStart;
    const char = code.charAt(position);

    if (char && char !== NEWLINE) {
      insertString(NEWLINE);
      return;
    }

    let lineStart = position - 1;

    while (lineStart > 0 && code.charAt(lineStart) !== NEWLINE) {
      lineStart--;
    }

    const line = code.slice(lineStart + 1, position);
    const indentation = findIndentation(line);
    let insertion = "\n";

    if (indentation) {
      insertion += SPACE.repeat(indentation);
    }

    insertString(insertion);
  }

  function onKeyEvent(event) {
    const { target } = event;

    if (event.key === "Tab" && !event.altKey) {
      event.preventDefault();
      onTab(event);
    }

    if (event.key === "Enter") {
      if (target.selectionEnd === target.selectionStart) {
        event.preventDefault();
        onEnter(event);
      }
    }

    updatePosition();
  }

  async function onUpdate() {
    updatePreview();
    syncScroll();
    onChange(valueProp.value);
  }

  function syncScroll() {
    preview.scrollTop = sourceRef.scrollTop;
    preview.scrollLeft = sourceRef.scrollLeft;
    lineNumbers.scrollTop = sourceRef.scrollTop;
  }

  const onSourceChange = debounce(() => {
    if (readonly.value) return;

    setSource(sourceRef.value);
    onUpdate();
  }, 10);

  function syncEditor() {
    if (sourceRef.value !== valueProp.value) {
      sourceRef.value = valueProp.value;
      onUpdate();
    }

    updatePreview();
  }

  onUpdateProp(syncEditor);
  onInit(syncEditor);

  watch(language, updatePreview);

  return {
    valueProp,
    onSourceChange,
    onSetLanguage,
    syncScroll,
    onKeyEvent,
    updatePosition,
  };
}
