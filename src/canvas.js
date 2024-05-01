const { createCanvas, loadImage, registerFont } = require("canvas");
const sharp = require("sharp");
const https = require('https');
const path = require('path');

class DiscordProfile {
    constructor() {
        this.canvas = createCanvas(700, 250);
        this.ctx = this.canvas.getContext("2d");
    }

    async profile({ name, discriminator, avatar, rank, xp, background, cardLight, cardDark, block } = {}) {
        if (!name) throw new Error("Profile name is not given.");
        if (!avatar) avatar = await this.resizeAndConvertToJpeg(name.displayAvatarURL({ size: 1024, dynamic: true, format: 'jpg' }));
        if (!rank) throw new Error("Rank is not given.");
        if (!xp) throw new Error("XP is not given.");

        // Check if the background is provided, otherwise use a default background
        if (!background) {
            if (gradiant) {
                let color = gradiant.find(x => x.name === gradiant.toLowerCase());
                if (!color) {
                    return console.log(`[ERROR] Gradient color not found!`);
                }

                background = color.background;
            } else {
                background = `https://images4.alphacoders.com/978/978917.jpg`;
            }
        }

        // Load the background image
        const fixedbkg = await loadImage(background);
        this.ctx.drawImage(fixedbkg, 0, 0, this.canvas.width, this.canvas.height);

        // if (block !== false) {
        //     let blurImage = await loadImage(`${__dirname}/../assets/images/rank.png`);
        //     this.ctx.drawImage(blurImage, 0, 0, this.canvas.width, this.canvas.height);
        // }

        this.ctx.fillStyle = cardLight ? cardLight : "#000000";
        this.ctx.globalAlpha = 0.2
        this.ctx.fillRect(43, 0, 170, 300);
        this.ctx.globalAlpha = 1;

        // Load and draw the avatar image
        try {
            const avatarImg = await loadImage(avatar);
            const resizeAvatar = await sharp(avatarImg).resize(640, 640).toBuffer();
            this.ctx.drawImage(resizeAvatar, 53, 15, 150, 150);
        } catch (error) {
            // If the avatar image type is not supported, convert it to JPEG and then draw
            console.log("Unsupported image type. Converting to JPEG...");
            avatar = await this.resizeAndConvertToJpeg(avatar);
            const avatarImg = await loadImage(avatar);
            this.ctx.drawImage(avatarImg, 53, 10, 150, 150);
        }

        this.ctx.fillStyle = cardDark ? cardDark : "black";
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillRect(53, 170, 150, 30);
        this.ctx.fillRect(53, 210, 150, 30);
        this.ctx.fillRect(670 - (name.length >= 29 ? (29 * 12) : (name.length * 12.5)  ), 13.5, 400, 30);
        this.ctx.fillRect(620, 50, 200, 25);
        this.ctx.globalAlpha = 1;

        this.ctx.fillStyle = "white"
        this.ctx.font = `20px Bold`;
        this.ctx.textAlign = "center";
        this.ctx.globalAlpha = 0.8;
        this.ctx.fillText("RANK : #" + rank, 125, 192)
        this.ctx.globalAlpha = 1;

        this.ctx.font = `bold 20px Bold`;
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.textAlign = "center";
        this.ctx.strokeStyle = "#f5f5f5";
        this.ctx.globalAlpha = 0.8;
        this.ctx.fillText("XP : " + xp, 126, 232)
        this.ctx.globalAlpha = 1;

        this.ctx.font = `bold 20px Manrope`;
        name = name.length > 29 ? name.substring(0, 29).trim() + ".." : name;
        this.ctx.textAlign = "right"
        this.ctx.fillText(`${name}`, 680, 35);
        this.ctx.fillText(`#${discriminator}`, 680, 69.5);

        return this.canvas.toBuffer();
    }



    async welcome(member, count, { link, gradiant, blur, block } = {}) {
        blur = blur !== false;

        if (link && gradiant) {
            return console.log(`[ERROR] You can't use link and gradient at the same time!`);
        }

        console.log(link);

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

        const font = 'Sans';

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
            let blurImage = await loadImage(`${__dirname}/../assets/images/welcome.png`);

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

        this.ctx.fillText(`count: ${count}`, 278, 160);

        let convertImg = await this.resizeAndConvertToJpeg(member.displayAvatarURL({ size: 1024, dynamic: true, format: 'jpg' }));

        const avatar = await loadImage(convertImg);

        this.drawCircularImage(this.ctx, avatar, 67, 42, 160);

        return this.canvas.toBuffer();
    }

    async rankcard({ member, currentXP, fullXP, level, rank, link, gradiant, block, fillStyle } = {}) {
        let name = member.username;
        let discriminator = member.discriminator;
        let avatarURL = member.displayAvatarURL({ size: 1024, dynamic: true, format: 'png' });

        if (!name) throw new Error('Please provide the name of the person');
        if (!discriminator) throw new Error('Please provide the discriminator of the person as it is the main element in the rank card');
        if (!currentXP) throw new Error('It is mandatory to have the current XP of the person to show stats');
        if (!fullXP) throw new Error('It is mandatory to have the Full XP number');
        if (!level) throw new Error('You did not provide the Level of the person');
        if (!rank) throw new Error('You did not provide the Rank of the person');
        if (!avatarURL) throw new Error('Avatar is missing');
        if (!link) {
            if (!gradiant) {
                throw new Error('Please give the link of the background image');
            }
        }

        if (gradiant) {
            if (link) throw new Error('You cannot use link and gradiant at the same time');
            let color = gradiant.find(x => x.name === gradiant.toLowerCase());
            if (!color) {
                throw new Error('Invalid Color name');
            }

            link = color.link;
        }

        const background = await loadImage(link);
        const font = 'Sans';
        this.ctx.drawImage(background, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

        if (block !== false) {
            let blurImage = await loadImage(`${__dirname}/../assets/images/rank.png`);
            this.ctx.drawImage(blurImage, 0, 0, this.canvas.width, this.canvas.height);
        }

        let convertImg = await this.resizeAndConvertToJpeg(member.displayAvatarURL({ size: 1024, dynamic: true, format: 'jpg' }));

        const avatarImageBuffer = await sharp(Buffer.from(convertImg))
            .resize(1024, 1024)
            .composite([{ input: Buffer.from(`<svg><circle cx="512" cy="512" r="512"/></svg>`), blend: 'dest-in' }])
            .toFormat('png')
            .toBuffer();

        console.log('Avatar image processed.');

        const avatarImage = await loadImage(avatarImageBuffer);

        this.ctx.drawImage(avatarImage, 44, 45, 155, 155);
        this.ctx.font = `bold 20px ${font}`;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'start';
        this.ctx.strokeStyle = '#f5f5f5';

        const xname = name.length > 18 ? name.substring(0, 18).trim() + '...' : name;
        this.ctx.fillText(`${name}`, 340, 52);

        this.ctx.font = `bold 20px ${font}`;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'start';
        this.ctx.strokeStyle = '#f5f5f5';

        this.ctx.fillText(`${discriminator}`, 580, 84);

        let x = 240;
        let y = 142;
        this.ctx.font = `bold 22px ${font}`;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'start';
        this.ctx.fillText(`/ ${change(fullXP)}`, x + this.ctx.measureText(change(currentXP)).width + 15, y);

        this.ctx.fillText(change(currentXP), x, y);

        let converted = currentXP;
        if (typeof currentXP === 'string') converted = parseInt(currentXP);
        let widthXP = (converted * 439) / fullXP;
        if (widthXP > 439 - 18.5) widthXP = 439 - 18.5;
        this.ctx.beginPath();

        let hash = null;

        if (fillStyle) {
            let rankColor = rankBarColor.find(x => x.name === fillStyle);
            if (!rankColor) {
                return console.log('Invalid rankBarColor Color :v');
            }

            hash = rankColor.hash;
        } else {
            console.log('fillStyle not found');
            hash = '#FFFFFF';
        }

        this.ctx.fillStyle = hash;

        this.ctx.fillRect(239, 119.5 + 36.25, widthXP, 23.5);

        this.ctx.fillStyle = '#FFFFFF';

        const RankN = rank.length > 5 ? rank.substring(0, 5).trim() + '+' : rank;
        this.ctx.fillText(`${RankN}`, 310, 210);

        const levelN = level.length > 6 ? level.substring(0, 6).trim() + '+' : level;
        this.ctx.fillText(`${levelN}`, 500, 210);

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
                            .resize(250, 250)
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

function change(xp) {
    return new Intl.NumberFormat().format(xp);
}

module.exports = DiscordProfile;
