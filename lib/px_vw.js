var css = require("css");
var extend = require("extend");

var defaultConfig = {
    baseWidth: 1080,
    accuracy: 4,
    skipComment: "px2vw-skip"
}

var REG_PX = /\b(\d+(\.\d+)?)px\b/;

function Px2vw(options) {
    this.config = extend({}, defaultConfig, options) || {};
}

Px2vw.prototype = {
    translate: function (cssText) {
        var that = this;
        var config = that.config;
        var cssObj = css.parse(cssText);

        _translateCssObj.call(this, cssObj.stylesheet.rules);

        return css.stringify(cssObj);
    }
}

function _translateCssObj(rules) {
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (rule.type === "media") {
            _translateCssObj.call(this, rule.rules);
            continue;
        } else if (rule.type === "keyframes") {
            _translateCssObj.call(this, rule.keyframes);
            continue;
        } else if (rule.type !== "rule" && rule.type !== "keyframe") {
            continue;
        } else {
            var declarations = rule.declarations;
            for (var j = 0; j < declarations.length; j++) {
                var declaration = declarations[j];
                if (declaration.type === 'declaration' && REG_PX.test(declaration.value)) {
                    var nextDeclaration = rule.declarations[j + 1];
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

function _getVw(value) {
    var that = this;
    var REG_PX_GLOBAL = new RegExp(REG_PX.source, 'g');
    return value.replace(REG_PX_GLOBAL, function (val, valGroup) {
        var newValue = valGroup * 100 / that.config.baseWidth;
        newValue = parseFloat(newValue.toFixed(that.config.accuracy));
        return newValue == 0 ? 0 : newValue + "vw";
    })
}

module.exports = Px2vw;