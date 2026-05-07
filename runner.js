const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * PPO Training Testbed Master Runner
 * This script automates 'npm install' and 'npm start' for all siteXXX directories.
 */

const sites = fs.readdirSync(__dirname)
    .filter(f => f.startsWith('site') && fs.lstatSync(f).isDirectory())
    .sort();

console.log(`\n🚀 [PPO Hub] Found ${sites.length} sites. Starting automation...\n`);

sites.forEach(site => {
    const sitePath = path.join(__dirname, site);
    const pkgPath = path.join(sitePath, 'package.json');

    if (!fs.existsSync(pkgPath)) {
        console.log(`[${site}] ⚠️  No package.json found. Skipping.`);
        return;
    }

    try {
        // 1. Install Dependencies
        if (!fs.existsSync(path.join(sitePath, 'node_modules'))) {
            console.log(`[${site}] 📦 Installing dependencies...`);
            execSync('npm install', { cwd: sitePath, stdio: 'inherit' });
        } else {
            console.log(`[${site}] ✅ node_modules already exists.`);
        }

        // 2. Start Server
        console.log(`[${site}] 🔥 Starting server...`);
        const p = spawn('npm', ['start'], { 
            cwd: sitePath, 
            shell: true, 
            stdio: ['ignore', 'pipe', 'pipe'] 
        });

        p.stdout.on('data', (data) => {
            if (data.toString().includes('running') || data.toString().includes('listening')) {
                console.log(`[${site}] 🟢 Server is UP: ${data.toString().trim()}`);
            }
        });

        p.stderr.on('data', (data) => {
            console.error(`[${site}] 🔴 Error: ${data.toString().trim()}`);
        });

    } catch (err) {
        console.error(`[${site}] ❌ Failed to start: ${err.message}`);
    }
});

console.log(`\n✨ All servers are being initialized. Check the console for UP signals.\n`);
