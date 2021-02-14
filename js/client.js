var win = nw.Window.get();
setTimeout(function(){win.show();},300);
win.setAlwaysOnTop(true);
const showdown = require("showdown");
const showdownHighlight = require("showdown-highlight");
const showdownKatex = require("showdown-katex");
var converter = new showdown.Converter({
    emoji: true,
    tables: true,
    strikethrough: true,
    literalMidWordUnderscores: true,
    splitAdjacentBlockquotes: true,
    extensions: [
        showdownKatex({
            throwOnError: true,
            displayMode: false,
            style_errorColor: '#ffff00',
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: '&&', right: '&&', display: true, asciimath: true },
            ],
        }),
        showdownHighlight,
    ],
});