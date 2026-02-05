import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs';

async function generateSlime() {
    console.log('Generating high-quality slime source with transparency...');

    // 1. Create a "High Quality" source (128x128) with Alpha = 0 (Transparent)
    const size = 128;
    const image = new Jimp({
        width: size,
        height: size,
        color: 0x00000000 // Fully transparent
    });

    // Draw a cute slime blob
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = (x - centerX) / (radius * 1.1);
            const dy = (y - centerY) / (radius * 0.9);
            const distance = dx * dx + dy * dy;

            if (distance < 1.0) {
                // Body
                let color = 0x44AAFFff; // Blue

                // Add a simple "glossy" highlight
                const hx = (x - centerX * 0.7) / (radius * 0.3);
                const hy = (y - centerY * 0.7) / (radius * 0.3);
                if (hx * hx + hy * hy < 1.0) {
                    color = 0x88CCFFff;
                }

                // Small black eyes
                const eyeY = centerY - radius * 0.2;
                const eyeLX = centerX - radius * 0.3;
                const eyeRX = centerX + radius * 0.3;
                const eyeDistL = Math.pow(x - eyeLX, 2) + Math.pow(y - eyeY, 2);
                const eyeDistR = Math.pow(x - eyeRX, 2) + Math.pow(y - eyeY, 2);

                if (eyeDistL < Math.pow(radius * 0.1, 2) || eyeDistR < Math.pow(radius * 0.1, 2)) {
                    color = 0x000000ff;
                }

                image.setPixelColor(color, x, y);
            }
        }
    }

    // Save source for reference
    const sourcePath = 'i:\\develop\\RougueLike\\scripts\\slime_source_generated.png';
    await image.write(sourcePath);
    console.log(`Source image (transparent) saved to: ${sourcePath}`);

    // 2. Scale down to 32x32 (Manual Nearest Neighbor to ensure NO bleeding)
    console.log('Scaling down to 32x32 (Bleed-free nearest neighbor)...');
    const scaledImage = new Jimp({ width: 32, height: 32, color: 0x00000000 });
    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
            const srcX = Math.floor(x * (size / 32));
            const srcY = Math.floor(y * (size / 32));
            const color = image.getPixelColor(srcX, srcY);
            scaledImage.setPixelColor(color, x, y);
        }
    }

    // 3. Fill background with Magenta (FF00FF) only for transparent pixels
    // This avoids magenta bleeding into the blue during scaling.
    console.log('Applying Magenta background to final 32x32 sprite...');
    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
            const color = scaledImage.getPixelColor(x, y);
            // If alpha is 0 (last 8 bits of color), fill with magenta
            if ((color & 0x000000FF) === 0) {
                scaledImage.setPixelColor(0xFF00FFff, x, y);
            }
        }
    }

    const outputPath = 'i:\\develop\\RougueLike\\public\\sprites\\enemies\\slime.png';
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    await scaledImage.write(outputPath);
    console.log(`Final bleed-free 32x32 sprite saved to: ${outputPath}`);
}

generateSlime().catch(err => {
    console.error(err);
    process.exit(1);
});
