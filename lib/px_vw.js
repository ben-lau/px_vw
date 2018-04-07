const css = require("css");
const objectAssiagn = require("object-assign");

const defaultConfig = {
    baseWidth: 1080,
    accuracy: 4,
    skipComment: "px2vw-skip"
}

const REG_PX = /\b(\d+(\.\d+)?)px\b/;

class Px_vw {
    constructor(options) {
        this.config = objectAssiagn({}, defaultConfig, options) || {};
    }
    convertCss(cssText) {
        const cssObj = css.parse(cssText);
        _convertCssObj.call(this, cssObj.stylesheet.rules);
        return css.stringify(cssObj);
    }
}

const _convertCssObj = function (rules) {
    for (let i = 0; i < rules.length; i++) {
        let rule = rules[i];
        if (rule.type === "media") {
            _convertCssObj.call(this, rule.rules);
            continue;
        } else if (rule.type === "keyframes") {
            _convertCssObj.call(this, rule.keyframes);
            continue;
        } else if (rule.type !== "rule" && rule.type !== "keyframe") {
            continue;
        } else {
            let declarations = rule.declarations;
            for (let j = 0; j < declarations.length; j++) {
                let declaration = declarations[j];
                if (declaration.type === 'declaration' && REG_PX.test(declaration.value)) {
                    let nextDeclaration = rule.declarations[j + 1];
                    if (nextDeclaration &&
                        nextDeclaration.type === 'comment' &&
                        nextDeclaration.comment &&
                        nextDeclaration.comment.trim() === this.config.skipComment
                    ) {
                        declarations.splice(j + 1, 1); // delete corresponding comment
                    } else {
                        declaration.value = _getVw.call(this, declaration.value);
                    }
                }
            }
        }
    }
}

const _getVw = function (value) {
    const REG_PX_GLOBAL = new RegExp(REG_PX.source, 'g');
    return value.replace(REG_PX_GLOBAL, (m, $1) => {
        let newValue = $1 * 100 / this.config.baseWidth;
        newValue = parseFloat(toFixed(newValue, this.config.accuracy));
        return newValue == 0 ? 0 : newValue + "vw";
    })
}

const toFixed = function (num, accuracy) {
    let times = Math.pow(10, accuracy + 1),
        des = parseInt(num * times),
        rest = des % 10;
    if (rest == 5) {
        return ((parseFloat(des) + 1) / times).toFixed(accuracy);
    }
    return num.toFixed(accuracy);
}

module.exports = Px_vw;