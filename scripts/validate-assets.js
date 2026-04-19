const fs = require('fs');
const path = require('path');

const assets = [
  { file: 'assets/images/icon.png', width: 1024, height: 1024 },
  { file: 'assets/images/splash-icon.png', width: 1024, height: 1024 },
  { file: 'assets/images/adaptive-foreground.png', width: 1024, height: 1024 },
  { file: 'assets/images/favicon.png', width: 48, height: 48 },
];

function readPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);

  if (buffer.length < 24) {
    throw new Error('File is too small to be a valid PNG.');
  }

  const signature = buffer.subarray(0, 8);
  const expected = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  if (!signature.equals(expected)) {
    throw new Error('File header is not PNG.');
  }

  if (buffer.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error('PNG missing IHDR chunk.');
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

let hasError = false;

for (const asset of assets) {
  const filePath = path.join(process.cwd(), asset.file);

  if (!fs.existsSync(filePath)) {
    console.error(`Missing asset: ${asset.file}`);
    hasError = true;
    continue;
  }

  try {
    const { width, height } = readPngSize(filePath);
    if (width !== asset.width || height !== asset.height) {
      console.error(
        `${asset.file} has invalid dimensions ${width}x${height}. Expected ${asset.width}x${asset.height}.`
      );
      hasError = true;
    } else {
      console.log(`OK ${asset.file} (${width}x${height})`);
    }
  } catch (error) {
    console.error(`Invalid asset ${asset.file}: ${error.message}`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log('All Expo image assets are valid PNG files.');
