const fs = require("fs");
const s = fs.readFileSync("app.json", "utf8");
const stack = [];
for (let i = 0; i < s.length; i++) {
  const c = s[i];
  if (c === "{") stack.push(i + 1);
  if (c === "}") stack.pop();
}
console.log("Unmatched opens count:", stack.length);
if (stack.length)
  console.log(
    "Last unmatched open at char index (1-based):",
    stack[stack.length - 1],
  );
else console.log("No unmatched opens");
const lines = s.split(/\r?\n/);
let acc = 0;
if (stack.length) {
  const idx = stack[stack.length - 1] - 1;
  for (let i = 0; i < lines.length; i++) {
    acc += lines[i].length + 1;
    if (acc > idx) {
      console.log("At line", i + 1, "content:", lines[i]);
      break;
    }
  }
}
