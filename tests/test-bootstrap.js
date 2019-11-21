const jsdom = require("jsdom");

const dom = new jsdom.JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost"
});
global.window = dom.window;

for (var key in dom.window) {
  if (!(key in global)) {
    global[key] = window[key];
  }
}
