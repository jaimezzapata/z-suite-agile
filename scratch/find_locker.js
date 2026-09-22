const { execSync } = require('child_process');

try {
  // Try handle.exe or openfiles or tasklist
  const tasks = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH').toString();
  console.log("Running node processes:\n", tasks);
} catch (e) {
  console.error(e.message);
}
