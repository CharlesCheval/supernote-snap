// Runs buildPlugin.ps1 on Windows and buildPlugin.sh elsewhere.
const {spawnSync} = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

function run(command, commandArgs) {
  return spawnSync(command, commandArgs, {stdio: 'inherit'});
}

let result;
if (process.platform === 'win32') {
  const psArgs = [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    path.join(__dirname, 'buildPlugin.ps1'),
    ...args,
  ];
  // pwsh reads the BOM-less UTF-8 script correctly; Windows PowerShell is the fallback.
  result = run('pwsh', psArgs);
  if (result.error && result.error.code === 'ENOENT') {
    result = run('powershell.exe', psArgs);
  }
} else {
  result = run('bash', [path.join(__dirname, 'buildPlugin.sh'), ...args]);
}

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
