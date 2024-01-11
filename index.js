const Canvas = require("canvas");
const path = require('path');

Canvas.registerFont(`${__dirname}/assets/fonts/LemonMilk.otf`, { family: "Bold" });
Canvas.registerFont(`${__dirname}/assets/fonts/JosefinSans-Regular.ttf`, { family: "Normal" });
Canvas.registerFont(__dirname + '/assets/fonts/normal.ttf', {
    family: 'Manrope',
    weight: 'regular',
    style: 'normal'
});
Canvas.registerFont(__dirname + '/assets/fonts/bold.ttf', {
    family: 'Manrope',
    weight: 'bold',
    style: 'normal'
});

module.exports = {
    DiscordProfile: require('./src/canvas.js'),
};
