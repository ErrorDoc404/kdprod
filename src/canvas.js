const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");
const https = require('https');

class DiscordCanvas {
    constructor() {
        this.canvas = createCanvas(700, 250);
        this.ctx = this.canvas.getContext("2d");
    }

    async welcome(member, { link, gradiant, blur, block } = {}) {
        blur = blur !== false;

        if (link && gradiant) {
            return console.log(`[ERROR] You can't use link and gradient at the same time!`);
        }

        if (!link) {
            if (gradiant) {
                let color = gradiant.find(x => x.name === gradiant.toLowerCase());
                if (!color) {
                    return console.log(`[ERROR] Gradient color not found!`);
                }

                link = color.link;
            } else {
                link = `https://images4.alphacoders.com/978/978917.jpg`;
            }
        }

        const font = 'Manrope';

        if (blur) {
            const img = await loadImage(link);
            img.blur(5);
            link = img.toBuffer();

            const fixedbkg = await loadImage(link);

            this.ctx.drawImage(fixedbkg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            const fixedbkg = await loadImage(link);

            this.ctx.drawImage(fixedbkg, 0, 0, this.canvas.width, this.canvas.height);
        }

        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

        if (block !== false) {
            let blurImage = await loadImage(
                "https://cdn.discordapp.com/attachments/989864191571664936/989864219224727564/welcome.png"
            );

            this.ctx.drawImage(blurImage, 0, 0, this.canvas.width, this.canvas.height);
        }

        let xname = member.username;

        this.ctx.font = `bold 36px ${font}`;
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.textAlign = "start";
        this.ctx.strokeStyle = "#f5f5f5";

        const name = xname.length > 12 ? `${xname.substring(0, 12).trim()}...` : xname;
        this.ctx.fillText(`${name}`, 278, 113);
        this.ctx.strokeText(`${name}`, 278, 113);

        this.ctx.font = `bold 20px ${font}`;
        this.ctx.fillStyle = "#FFFFFF";

        this.ctx.fillText(`#${member.discriminator}`, 278, 160);

        let convertImg = await this.resizeAndConvertToJpeg(member.displayAvatarURL({ size: 1024, dynamic: true, format: 'jpg' }));

        console.log(convertImg);

        const avatar = await loadImage(convertImg);

        this.drawCircularImage(this.ctx, avatar, 72, 48, 150);

        return this.canvas.toBuffer();
    }

    async resizeAndConvertToJpeg(imgUrl) {
        return new Promise((resolve, reject) => {
            https.get(imgUrl, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to fetch the image. Status Code: ${response.statusCode}`));
                    return;
                }

                let chunks = [];

                response.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                response.on('end', async () => {
                    try {
                        const buffer = Buffer.concat(chunks);
                        const resizedBuffer = await sharp(buffer)
                            .resize(150, 150)
                            .jpeg()
                            .toBuffer();
                        resolve(resizedBuffer);
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    drawCircularImage(ctx, image, x, y, diameter) {
        // Create a circular clipping path
        ctx.beginPath();
        ctx.arc(x + diameter / 2, y + diameter / 2, diameter / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw the image
        ctx.drawImage(image, x, y, diameter, diameter);
    }
}

module.exports = DiscordCanvas;
