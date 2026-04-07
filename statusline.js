#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    const data = JSON.parse(input);
    const model = data.model.display_name;
    const dir = path.basename(data.workspace.current_dir);
    const cost = data.cost?.total_cost_usd || 0;
    const pct = Math.floor(data.context_window?.used_percentage || 0);
    const durationMs = data.cost?.total_duration_ms || 0;
    const CYAN = '\x1b[36m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', RED = '\x1b[31m', RESET = '\x1b[0m';
    const barColor = pct >= 90 ? RED : pct >= 70 ? YELLOW : GREEN;
    const filled = Math.floor(pct / 10);
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
    const mins = Math.floor(durationMs / 60000);
    const secs = Math.floor((durationMs % 60000) / 1000);

    let branch = '';
    let repoLink = '';
    let linesChanged = '';
    try {
        const shortstat = execSync('git diff --shortstat HEAD', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], cwd: data.workspace.current_dir }).trim();
        if (shortstat) {
            const ins = (shortstat.match(/(\d+) insertion/) || [])[1];
            const del = (shortstat.match(/(\d+) deletion/) || [])[1];
            const parts = [];
            if (ins) parts.push(`${GREEN}+${ins}${RESET}`);
            if (del) parts.push(`${RED}-${del}${RESET}`);
            if (parts.length) linesChanged = ` | ${parts.join(' ')}`;
        }
    } catch {}
    try {
        branch = execSync('git branch --show-current', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        branch = branch ? ` | 🌿 ${branch}` : '';
    } catch {}
    try {
        let remote = execSync('git remote get-url origin', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
        remote = remote.replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git$/, '');
        repoLink = ` | 🔗 ${remote}`;
    } catch {}


    const fiveHourPct = data.rate_limits?.five_hour?.used_percentage;
    const sevenDayPct = data.rate_limits?.seven_day?.used_percentage;
    let rateLimitStr = '';
    if (fiveHourPct != null) {
        const fPct = Math.round(fiveHourPct);
        const fColor = fPct >= 90 ? RED : fPct >= 70 ? YELLOW : GREEN;
        rateLimitStr += ` | ${fColor}5h: ${fPct}%${RESET}`;
    }
    if (sevenDayPct != null) {
        const wPct = Math.round(sevenDayPct);
        const wColor = wPct >= 90 ? RED : wPct >= 70 ? YELLOW : GREEN;
        rateLimitStr += ` | ${wColor}7d: ${wPct}%${RESET}`;
    }

    console.log(`${CYAN}[${model}]${RESET} 📁 ${dir}${branch}${linesChanged}${repoLink}`);
    console.log(`${barColor}${bar}${RESET} ${pct}% | ${YELLOW}$${cost.toFixed(2)}${RESET} | ⏱️ ${mins}m ${secs}s${rateLimitStr}`);
});
