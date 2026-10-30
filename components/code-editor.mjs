import hljs from "https://unpkg.com/@highlightjs/cdn-assets@11.11.1/es/highlight.min.js";
import { autocompleteToken, replaceAutocomplete } from "./composer-autocomplete.mjs";
import {
  watch,
  ref,
  templateRef,
  defineEvent,
  defineProp,
  onUpdate as onUpdateProp,
  onInit,
  getElement,
  loadCss,
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
    if (string.charAt(cursor) !== SPACE) {
      break;
    }
    cursor++;
  }

  return cursor;
}

export default function () {
  const element = getElement();
  defineProp("name");
  defineProp("status");
  const valueProp = defineProp("value");
  const language = defineProp("language");
  const nostatus = defineProp("nostatus");
  const nolines = defineProp("nolines");
  const theme = defineProp("theme", { default: "atom-one-dark" });
  const readonly = defineProp("readonly");
  const wrap = defineProp("wrap");
  const autocomplete = defineProp("autocomplete");
  const label = defineProp("label", { default: "Code editor" });
  const onChange = defineEvent("change");
  const preview = templateRef("preview").value;
  const sourceRef = templateRef("sourceRef").value;
  const cursor = templateRef("cursor").value;
  const lineNumbers = templateRef("lines").value;
  const caretColor = ref("black");
  const suggestions = document.createElement("div");
  suggestions.id = "editor-suggestions";
  suggestions.setAttribute("role", "listbox");
  suggestions.setAttribute("aria-label", "Suggestions");
  suggestions.hidden = true;
  suggestions.className = "editor-suggestions";
  sourceRef.parentElement.append(suggestions);
  let requestId = 0;
  let options = [];
  let active = 0;
  let currentToken = null;

  function closeSuggestions() {
    requestId++;
    options = [];
    currentToken = null;
    suggestions.hidden = true;
    suggestions.replaceChildren();
    if (typeof autocomplete.value === "function") {
      sourceRef.setAttribute("aria-expanded", "false");
    } else {
      sourceRef.removeAttribute("aria-expanded");
    }
    sourceRef.removeAttribute("aria-activedescendant");
  }

  function renderSuggestions() {
    suggestions.replaceChildren();
    options.forEach((option, index) => {
      const item = document.createElement("div");
      item.id = `editor-suggestion-${index}`;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(index === active));
      item.textContent = option.label;
      item.addEventListener("mousedown", (event) => event.preventDefault());
      item.addEventListener("click", () => selectSuggestion(index));
      suggestions.append(item);
    });
    suggestions.hidden = false;
    sourceRef.setAttribute("aria-expanded", "true");
    sourceRef.setAttribute("aria-activedescendant", `editor-suggestion-${active}`);
    suggestions.children[active].scrollIntoView({ block: "nearest" });
  }

  function selectSuggestion(index) {
    const token = currentToken;
    const option = options[index];
    if (!token || !option || readonly.value) {
      return;
    }
    const value = replaceAutocomplete(sourceRef.value, token, option.value);
    const position = token.start + option.value.length;
    sourceRef.value = value;
    setSource(value);
    updateSelection(position, position);
    closeSuggestions();
    sourceRef.focus();
    onUpdate();
  }

  async function updateSuggestions() {
    closeSuggestions();
    if (readonly.value || typeof autocomplete.value !== "function") {
      return;
    }
    const token = autocompleteToken(sourceRef.value, sourceRef.selectionStart, sourceRef.selectionEnd);
    if (!token) {
      return;
    }
    const id = requestId;
    let result;
    try {
      result = await autocomplete.value({ ...token, value: sourceRef.value });
    } catch {
      return;
    }
    if (id !== requestId || !Array.isArray(result)) {
      return;
    }
    options = result.filter((item) => item && typeof item.label === "string" && typeof item.value === "string");
    if (!options.length) {
      return;
    }
    currentToken = token;
    active = 0;
    renderSuggestions();
  }

  function syncWrap() {
    const enabled = !!wrap.value;
    sourceRef.wrap = enabled ? "soft" : "off";
    sourceRef.style.whiteSpace = enabled ? "pre-wrap" : "";
    sourceRef.style.overflowWrap = enabled ? "anywhere" : "";
    preview.style.whiteSpace = enabled ? "pre-wrap" : "";
    preview.style.overflowWrap = enabled ? "anywhere" : "";
    sourceRef.setAttribute("aria-label", label.value || "Code editor");
    if (typeof autocomplete.value === "function") {
      sourceRef.setAttribute("role", "combobox");
      sourceRef.setAttribute("aria-autocomplete", "list");
      sourceRef.setAttribute("aria-controls", "editor-suggestions");
    } else {
      sourceRef.removeAttribute("role");
      sourceRef.removeAttribute("aria-autocomplete");
      sourceRef.removeAttribute("aria-controls");
      sourceRef.removeAttribute("aria-expanded");
    }
  }

  /**
   * Calculates the optimal contrasting color (black or white)
   * based on background color of code preview, using the YIQ formula
   */
  function computeCaretColor() {
    const bgColor = window.getComputedStyle(preview).backgroundColor;
    const rgbValues = bgColor.match(/\d+/g);

    if (!rgbValues || rgbValues.length < 3) {
      return "black";
    }

    const r = parseInt(rgbValues[0], 10);
    const g = parseInt(rgbValues[1], 10);
    const b = parseInt(rgbValues[2], 10);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // 4. Set caret color based on the threshold (128 is the middle of 0-255)
    element.style.caretColor = brightness >= 128 ? "black" : "white";
  }

  function onSetLanguage() {
    const v = prompt("language", language.value) || "";
    language.value = v.trim();
  }

  function setSource(s) {
    valueProp.value = s;
  }

  function updatePreview() {
    const code = sourceRef.value + NEWLINE;
    const lang = language.value;
    const hl = lang
      ? hljs.highlight(code, {
          language: lang,
          ignoreIllegals: true,
        })
      : hljs.highlightAuto(code);

    preview.innerHTML = hl.value;
    language.value = hl.language;

    lineNumbers.innerHTML = nolines.value
      ? ""
      : Array(countChars(code, NEWLINE) || 1)
          .fill("<span></span>")
          .join("");

    updatePosition();
  }

  function countChars(str, char) {
    const max = str.length;
    let count = 0;
    let i = 0;

    while (i < max) {
      if (str[i++] === char) {
        count++;
      }
    }

    return count;
  }

  function insertString(string) {
    const start = sourceRef.selectionStart;
    const position = start + string.length;
    const code = sourceRef.value;
    const beforeBlock = code.slice(0, start);
    const afterBlock = code.slice(start);
    sourceRef.value = beforeBlock + string + afterBlock;
    setSource(sourceRef.value);
    updateSelection(position, position);
    onUpdate();
  }

  const updatePosition = debounce(function updatePosition() {
    if (nostatus.value) {
      return;
    }

    let start = sourceRef.selectionStart;
    let end = sourceRef.selectionEnd;

    if (start > end) {
      start = sourceRef.selectionEnd;
      end = sourceRef.selectionStart;
    }

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
    const code = sourceRef.value;
    let start = target.selectionStart;
    const end = target.selectionEnd;

    if (start > 0 && code.charAt(start - 1) !== NEWLINE) {
      start = code.slice(0, start).lastIndexOf(NEWLINE);
    }

    const beforeBlock = code.slice(0, start);
    const afterBlock = code.slice(end);
    const selection = code.slice(start, end);
    const lines = selection.split(NEWLINE);
    const modifiedBlock = lines.map((line) => (shiftKey ? line.replace(SPACES, "") : SPACES + line)).join(NEWLINE);

    sourceRef.value = beforeBlock + modifiedBlock + afterBlock;
    setSource(sourceRef.value);
    updateSelection(start, start + modifiedBlock.length);
    onUpdate();
  }

  function moveCodeLine(event) {
    const { target, shiftKey } = event;
    const code = sourceRef.value;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const left = code.slice(0, start);
    const right = code.slice(end);
    const lines = right.split(NEWLINE);
    const line = lines.shift() || "";
    const updatedLine = shiftKey ? line.replace(SPACES, "") : SPACES + line;
    const newSource = left + [updatedLine, ...lines].join(NEWLINE);
    const cursorPosition = shiftKey ? start - SPACES.length : start + SPACES.length;

    sourceRef.value = newSource;
    setSource(newSource);
    updateSelection(cursorPosition, cursorPosition);
    onUpdate();
  }

  function updateSelection(start, end) {
    sourceRef.setSelectionRange(start, end);
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
    const code = sourceRef.value;
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

    if (event.isComposing) {
      return;
    }

    if (options.length && !event.isComposing) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        active = (active + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
        renderSuggestions();
        return;
      }
      if (
        (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) ||
        (event.key === "Tab" && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey)
      ) {
        event.preventDefault();
        selectSuggestion(active);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeSuggestions();
        return;
      }
    }

    if (event.key === "Tab" && !event.altKey) {
      event.preventDefault();
      onTab(event);
    }

    if (event.key === "Enter") {
      closeSuggestions();
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
    if (readonly.value) {
      return;
    }

    setSource(sourceRef.value);
    onUpdate();
    updateSuggestions();
  }, 10);

  function onInput() {
    closeSuggestions();
    onSourceChange();
  }

  function onCaretChange() {
    updatePosition();
    updateSuggestions();
  }

  function syncEditor() {
    closeSuggestions();
    syncWrap();
    if (sourceRef.value !== valueProp.value) {
      sourceRef.value = valueProp.value;
      onUpdate();
    }

    updatePreview();
  }

  onUpdateProp(syncEditor);
  onInit(syncEditor);

  watch(language, updatePreview);
  watch(wrap, syncWrap);
  watch(theme, async () => {
    const sheet = await loadCss(`https://unpkg.com/@highlightjs/cdn-assets@11.11.1/styles/${theme.value}.min.css`, {
      adopt: false,
    });
    sheet.theme = true;
    element.shadowRoot.adoptedStyleSheets = element.shadowRoot.adoptedStyleSheets.filter((s) => !s.theme).concat(sheet);
    caretColor.value = computeCaretColor();
  });

  return {
    valueProp,
    caretColor,
    onSourceChange,
    onInput,
    onCaretChange,
    closeSuggestions,
    onSetLanguage,
    syncScroll,
    onKeyEvent,
    updatePosition,
  };
}
