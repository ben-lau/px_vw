var commander = require("commander");
var fs = require("fs-extra");
var path = require("path");
var chalk = require("chalk");
var package = require("./../package.json");
var Px2vw = require("./../lib/px_vw");

commander.version(package.version)
    .option("-w, --baseWidth [value]", "set your proto graph width", 1080)
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

var config = {
    baseWidth: commander.baseWidth
}

var px2vw = new Px2vw(config);

commander.args.forEach(function (filePath) {
    if (path.extname(filePath) !== '.css') {
        return;
    }

    var cssText = fs.readFileSync(filePath, { encoding: 'utf8' });
    var outputPath = commander.output || path.dirname(filePath);
    var fileName = path.basename(filePath);

    var newCssText = px2vw.translate(cssText);
    var newFileName = fileName.replace(".css", ".vw.css");
    var newFilePath = path.join(outputPath, newFileName);

    fs.createFileSync(newFilePath);
    fs.writeFileSync(newFilePath, newCssText, { encoding: "utf8" });
    console.log(chalk.green.bold("your new stylesheet is in" + newFilePath));
})