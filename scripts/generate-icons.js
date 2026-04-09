const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we can generate PNG icons from SVG
function generateIcons() {
  const svgPath = path.join(__dirname, 'build', 'icon.svg');
  
  if (!fs.existsSync(svgPath)) {
    console.log('⚠️  SVG icon not found at:', svgPath);
    return;
  }

  const sizes = [16, 32, 48, 64, 128, 256, 512];
  
  sizes.forEach(size => {
    try {
      const outputPath = path.join(__dirname, 'build', `icon${size}.png`);
      execSync(`convert -resize ${size}x${size} "${svgPath}" "${outputPath}"`, { stdio: 'ignore' });
      console.log(`✓ Generated icon${size}.png`);
    } catch (err) {
      console.log(`⚠️  Could not generate icon${size}.png (ImageMagick not found)`);
    }
  });
}

generateIcons();
