import { readFileSync, writeFileSync } from 'node:fs';

const arg = process.argv[2];
const levels = ['major', 'minor', 'patch'];
const semver = /^(\d+)\.(\d+)\.(\d+)$/;

if (!arg) {
    console.error('Usage: mise run bump <major|minor|patch|x.y.z>');
    process.exit(1);
}

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const current = manifest.version;

let next;
if (levels.includes(arg)) {
    const match = current.match(semver);
    if (!match) {
        console.error(`Current manifest version "${current}" is not x.y.z`);
        process.exit(1);
    }
    let [major, minor, patch] = match.slice(1).map(Number);
    if (arg === 'major') {
        major += 1;
        minor = 0;
        patch = 0;
    } else if (arg === 'minor') {
        minor += 1;
        patch = 0;
    } else {
        patch += 1;
    }
    next = `${major}.${minor}.${patch}`;
} else if (semver.test(arg)) {
    next = arg;
} else {
    console.error(`Invalid version or bump level: ${arg}`);
    process.exit(1);
}

const writeJson = (path, value, indent) =>
    writeFileSync(path, `${JSON.stringify(value, null, indent)}\n`);

manifest.version = next;
writeJson('manifest.json', manifest, 4);

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
pkg.version = next;
writeJson('package.json', pkg, 4);

const versions = JSON.parse(readFileSync('versions.json', 'utf8'));
versions[next] = manifest.minAppVersion;
writeJson('versions.json', versions, '\t');

console.log(`Bumped ${current} -> ${next}`);
console.log('');
console.log('Next steps:');
console.log(`  git commit -am "chore: release ${next}"`);
console.log('  git push');
console.log(`  gh release create ${next} --title ${next} --generate-notes`);
