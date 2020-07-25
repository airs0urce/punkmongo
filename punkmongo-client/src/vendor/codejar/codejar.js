"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.CodeJar = void 0;
function CodeJar(editor, highlight, opt) {
    if (opt === void 0) { opt = {}; }
    var options = __assign({ tab: "\t", indentOn: /{$/, enableSelfClosing: true }, opt);
    var listeners = [];
    var history = [];
    var at = -1;
    var focus = false;
    var callback;
    var prev; // code content prior keydown event
    var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
    editor.setAttribute("contentEditable", isFirefox ? "true" : "plaintext-only");
    editor.setAttribute("spellcheck", "false");
    editor.style.outline = "none";
    editor.style.overflowWrap = "break-word";
    editor.style.overflowY = "auto";
    editor.style.resize = "vertical";
    editor.style.whiteSpace = "pre-wrap";
    highlight(editor);
    var debounceHighlight = debounce(function () {
        var pos = save();
        highlight(editor);
        restore(pos);
    }, 30);
    var recording = false;
    var shouldRecord = function (event) {
        return !isUndo(event) && !isRedo(event)
            && event.key !== "Meta"
            && event.key !== "Control"
            && event.key !== "Alt"
            && !event.key.startsWith("Arrow");
    };
    var debounceRecordHistory = debounce(function (event) {
        if (shouldRecord(event)) {
            recordHistory();
            recording = false;
        }
    }, 300);
    var on = function (type, fn) {
        listeners.push([type, fn]);
        editor.addEventListener(type, fn);
    };
    on("keydown", function (event) {
        if (event.defaultPrevented)
            return;
        prev = toString();
        handleNewLine(event);
        handleTabCharacters(event);
        handleSelfClosingCharacters(event);
        handleUndoRedo(event);
        if (shouldRecord(event) && !recording) {
            recordHistory();
            recording = true;
        }
    });
    on("keyup", function (event) {
        if (event.defaultPrevented)
            return;
        if (event.isComposing)
            return;
        if (prev !== toString())
            debounceHighlight();
        debounceRecordHistory(event);
        if (callback)
            callback(toString());
    });
    on("focus", function (_event) {
        focus = true;
    });
    on("blur", function (_event) {
        focus = false;
    });
    on("paste", function (event) {
        recordHistory();
        handlePaste(event);
        recordHistory();
        if (callback)
            callback(toString());
    });
    function save() {
        var s = window.getSelection();
        var pos = { start: 0, end: 0, dir: undefined };
        visit(editor, function (el) {
            if (el === s.anchorNode && el === s.focusNode) {
                pos.start += s.anchorOffset;
                pos.end += s.focusOffset;
                pos.dir = s.anchorOffset <= s.focusOffset ? "->" : "<-";
                return "stop";
            }
            if (el === s.anchorNode) {
                pos.start += s.anchorOffset;
                if (!pos.dir) {
                    pos.dir = "->";
                }
                else {
                    return "stop";
                }
            }
            else if (el === s.focusNode) {
                pos.end += s.focusOffset;
                if (!pos.dir) {
                    pos.dir = "<-";
                }
                else {
                    return "stop";
                }
            }
            if (el.nodeType === Node.TEXT_NODE) {
                if (pos.dir != "->")
                    pos.start += el.nodeValue.length;
                if (pos.dir != "<-")
                    pos.end += el.nodeValue.length;
            }
        });
        return pos;
    }
    function restore(pos) {
        var _a;
        var s = window.getSelection();
        var startNode, startOffset = 0;
        var endNode, endOffset = 0;
        if (!pos.dir)
            pos.dir = "->";
        if (pos.start < 0)
            pos.start = 0;
        if (pos.end < 0)
            pos.end = 0;
        // Flip start and end if the direction reversed
        if (pos.dir == "<-") {
            var start = pos.start, end = pos.end;
            pos.start = end;
            pos.end = start;
        }
        var current = 0;
        visit(editor, function (el) {
            if (el.nodeType !== Node.TEXT_NODE)
                return;
            var len = (el.nodeValue || "").length;
            if (current + len >= pos.start) {
                if (!startNode) {
                    startNode = el;
                    startOffset = pos.start - current;
                }
                if (current + len >= pos.end) {
                    endNode = el;
                    endOffset = pos.end - current;
                    return "stop";
                }
            }
            current += len;
        });
        // If everything deleted place cursor at editor
        if (!startNode)
            startNode = editor;
        if (!endNode)
            endNode = editor;
        // Flip back the selection
        if (pos.dir == "<-") {
            _a = [endNode, endOffset, startNode, startOffset], startNode = _a[0], startOffset = _a[1], endNode = _a[2], endOffset = _a[3];
        }
        s.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
    }
    function beforeCursor() {
        var s = window.getSelection();
        var r0 = s.getRangeAt(0);
        var r = document.createRange();
        r.selectNodeContents(editor);
        r.setEnd(r0.startContainer, r0.startOffset);
        return r.toString();
    }
    function afterCursor() {
        var s = window.getSelection();
        var r0 = s.getRangeAt(0);
        var r = document.createRange();
        r.selectNodeContents(editor);
        r.setStart(r0.endContainer, r0.endOffset);
        return r.toString();
    }
    function handleNewLine(event) {
        if (event.key === "Enter") {
            var before = beforeCursor();
            var after = afterCursor();
            var padding = findPadding(before)[0];
            var newLinePadding = padding;
            // If last symbol is "{" ident new line
            // Allow user defines indent rule
            if (options.indentOn.test(before)) {
                newLinePadding += options.tab;
            }
            if (isFirefox) {
                preventDefault(event);
                insert("\n" + newLinePadding);
            }
            else {
                // Normal browsers
                if (newLinePadding.length > 0) {
                    preventDefault(event);
                    insert("\n" + newLinePadding);
                }
            }
            // Place adjacent "}" on next line
            if (newLinePadding !== padding && after[0] === "}") {
                var pos = save();
                insert("\n" + padding);
                restore(pos);
            }
        }
    }
    function handleSelfClosingCharacters(event) {
        if (!options.enableSelfClosing) {
            return;
        }
        var open = "([{'\"";
        var close = ")]}'\"";
        var codeAfter = afterCursor();
        if (close.includes(event.key) && codeAfter.substr(0, 1) === event.key) {
            var pos = save();
            preventDefault(event);
            pos.start = ++pos.end;
            restore(pos);
        }
        else if (open.includes(event.key)) {
            var pos = save();
            preventDefault(event);
            var text = event.key + close[open.indexOf(event.key)];
            insert(text);
            pos.start = ++pos.end;
            restore(pos);
        }
    }
    function handleTabCharacters(event) {
        if (event.key === "Tab") {
            preventDefault(event);
            if (event.shiftKey) {
                var before = beforeCursor();
                var _a = findPadding(before), padding = _a[0], start = _a[1];
                if (padding.length > 0) {
                    var pos = save();
                    // Remove full length tab or just remaining padding
                    var len = Math.min(options.tab.length, padding.length);
                    restore({ start: start, end: start + len });
                    document.execCommand("delete");
                    pos.start -= len;
                    pos.end -= len;
                    restore(pos);
                }
            }
            else {
                insert(options.tab);
            }
        }
    }
    function handleUndoRedo(event) {
        if (isUndo(event)) {
            preventDefault(event);
            at--;
            var record = history[at];
            if (record) {
                editor.innerHTML = record.html;
                restore(record.pos);
            }
            if (at < 0)
                at = 0;
        }
        if (isRedo(event)) {
            preventDefault(event);
            at++;
            var record = history[at];
            if (record) {
                editor.innerHTML = record.html;
                restore(record.pos);
            }
            if (at >= history.length)
                at--;
        }
    }
    function recordHistory() {
        if (!focus)
            return;
        var html = editor.innerHTML;
        var pos = save();
        var lastRecord = history[at];
        if (lastRecord) {
            if (lastRecord.html === html
                && lastRecord.pos.start === pos.start
                && lastRecord.pos.end === pos.end)
                return;
        }
        at++;
        history[at] = { html: html, pos: pos };
        history.splice(at + 1);
        var maxHistory = 300;
        if (at > maxHistory) {
            at = maxHistory;
            history.splice(0, 1);
        }
    }
    function handlePaste(event) {
        preventDefault(event);
        var text = (event.originalEvent || event).clipboardData.getData("text/plain");
        var pos = save();
        insert(text);
        highlight(editor);
        restore({ start: pos.end + text.length, end: pos.end + text.length });
    }
    function visit(editor, visitor) {
        var queue = [];
        if (editor.firstChild)
            queue.push(editor.firstChild);
        var el = queue.pop();
        while (el) {
            if (visitor(el) === "stop")
                break;
            if (el.nextSibling)
                queue.push(el.nextSibling);
            if (el.firstChild)
                queue.push(el.firstChild);
            el = queue.pop();
        }
    }
    function isCtrl(event) {
        return event.metaKey || event.ctrlKey;
    }
    function isUndo(event) {
        return isCtrl(event) && !event.shiftKey && event.code === "KeyZ";
    }
    function isRedo(event) {
        return isCtrl(event) && event.shiftKey && event.code === "KeyZ";
    }
    function insert(text) {
        text = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        document.execCommand("insertHTML", false, text);
    }
    function debounce(cb, wait) {
        var timeout = 0;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            clearTimeout(timeout);
            timeout = window.setTimeout(function () { return cb.apply(void 0, args); }, wait);
        };
    }
    function findPadding(text) {
        // Find beginning of previous line.
        var i = text.length - 1;
        while (i >= 0 && text[i] !== "\n")
            i--;
        i++;
        // Find padding of the line.
        var j = i;
        while (j < text.length && /[ \t]/.test(text[j]))
            j++;
        return [text.substring(i, j) || "", i, j];
    }
    function toString() {
        return editor.textContent || "";
    }
    function preventDefault(event) {
        event.preventDefault();
    }
    return {
        updateOptions: function (options) {
            options = __assign(__assign({}, options), options);
        },
        updateCode: function (code) {
            editor.textContent = code;
            highlight(editor);
        },
        onUpdate: function (cb) {
            callback = cb;
        },
        toString: toString,
        destroy: function () {
            for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                var _a = listeners_1[_i], type = _a[0], fn = _a[1];
                editor.removeEventListener(type, fn);
            }
        }
    };
}
exports.CodeJar = CodeJar;
