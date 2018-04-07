const commander = require("commander");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const package = require("./../package.json");
const Px_vw = require("./../lib/px_vw");

commander.version(package.version)
    .option("-w, --baseWidth [value]", "set your proto design width", 1080)
    .option("-a, --accuracy [value]", "set the digital accurarcy of converted stylesheet", 4)
    .option("-o, --output [path]", "the output file dirname")
    .parse(process.argv);

if (!commander.args.length) {
    console.log(chalk.red("[Error]:") + "please give me a file");
    return false;
}

if (commander.args.findIndex(function (filePath) {
    return path.extname(filePath) === '.css'
}) < 0) {
    console.log(chalk.red("[Error]:") + "please give me a css file")
    return false;
}

const config = {
    baseWidth: commander.baseWidth,
    accuracy: commander.accuracy
}

const px_vw = new Px_vw(config);

commander.args.forEach(function (filePath) {
    if (path.extname(filePath) !== '.css') {
        return;
    }

    const cssText = fs.readFileSync(filePath, { encoding: 'utf8' });
    const outputPath = commander.output || path.dirname(filePath);
    const fileName = path.basename(filePath);

    const newCssText = px_vw.convertCss(cssText);
    const newFileName = fileName.replace(".css", ".vw.css");
    const newFilePath = path.join(outputPath, newFileName);

    fs.writeFileSync(newFilePath, newCssText, { encoding: "utf8" });
    console.log(chalk.green.bold("your new stylesheet is in" + newFilePath));
})