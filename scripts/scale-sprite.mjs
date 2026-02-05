import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs';

async function generateSlime() {
    console.log('Generating high-quality cute slime source with transparency...');

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
            // Shape: Squashed circle (wider than tall)
            const dx = (x - centerX) / (radius * 1.22);
            const dy = (y - (centerY + radius * 0.15)) / (radius * 0.8); // Shift down slightly
            const distance = dx * dx + dy * dy;

            // Outline: Slightly larger radius
            const outlineDx = (x - centerX) / (radius * 1.28);
            const outlineDy = (y - (centerY + radius * 0.15)) / (radius * 0.86);
            const outlineDistance = outlineDx * outlineDx + outlineDy * outlineDy;

            if (distance < 1.0) {
                // Body (Vibrant Pastel Blue)
                let color = 0x55CCFFff;

                // Add a simple "glossy" highlight
                const hx = (x - centerX * 0.8) / (radius * 0.4);
                const hy = (y - centerY * 0.8) / (radius * 0.25);
                if (hx * hx + hy * hy < 1.0) {
                    color = 0xAAEEFFff;
                }

                // Eyes: Larger and lower
                const eyeY = centerY + radius * 0.05;
                const eyeLX = centerX - radius * 0.4;
                const eyeRX = centerX + radius * 0.4;
                const eyeDistL = Math.pow(x - eyeLX, 2) + Math.pow(y - eyeY, 2);
                const eyeDistR = Math.pow(x - eyeRX, 2) + Math.pow(y - eyeY, 2);

                const eyeRadius = radius * 0.15;
                if (eyeDistL < Math.pow(eyeRadius, 2) || eyeDistR < Math.pow(eyeRadius, 2)) {
                    color = 0x000000ff;

                    // White sparkle in eyes
                    const sparkY = eyeY - eyeRadius * 0.3;
                    const sparkLX = eyeLX + eyeRadius * 0.2;
                    const sparkRX = eyeRX + eyeRadius * 0.2;
                    const sparkDistL = Math.pow(x - sparkLX, 2) + Math.pow(y - sparkY, 2);
                    const sparkDistR = Math.pow(x - sparkRX, 2) + Math.pow(y - sparkY, 2);
                    if (sparkDistL < Math.pow(eyeRadius * 0.3, 2) || sparkDistR < Math.pow(eyeRadius * 0.3, 2)) {
                        color = 0xffffffff;
                    }
                }

                // Blush: Soft pink cheeks below eyes
                const blushY = centerY + radius * 0.32;
                const blushLX = centerX - radius * 0.6;
                const blushRX = centerX + radius * 0.6;
                const blushDistL = Math.pow((x - blushLX) / 1.5, 2) + Math.pow(y - blushY, 2);
                const blushDistR = Math.pow((x - blushRX) / 1.5, 2) + Math.pow(y - blushY, 2);
                if (blushDistL < Math.pow(radius * 0.15, 2) || blushDistR < Math.pow(radius * 0.15, 2)) {
                    color = 0xFF99AAff;
                }

                image.setPixelColor(color, x, y);
            } else if (outlineDistance < 1.0) {
                // Outline (Darker Blue)
                image.setPixelColor(0x224488ff, x, y);
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
    console.log('Applying Magenta background to final 32x32 sprite...');
    for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) {
            const color = scaledImage.getPixelColor(x, y);
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
    console.log(`Final cute 32x32 sprite saved to: ${outputPath}`);
}

generateSlime().catch(err => {
    console.error(err);
    process.exit(1);
});
