// MIT © 2016 azu
"use strict";
const chrono = require("chrono-node");
const moment = require('moment');
/**
 * from chrono tags
 * @type {[RegExp]}
 */
const supportedLang = [
    [/^EN/i, "en"],
    [/^JP/i, "ja"],
    [/^ES/i, "es"],
    [/^FR/i, "fr"],
    [/^ZH/i, "zh"]
];

/**
 * detect lang and return language string
 * @param {string[]} tags
 * @param {string} [preferLang]
 * @returns {string|null}
 */
const detectLang = (tags, preferLang) => {
    if (preferLang) {
        return preferLang;
    }
    const targetLangs = supportedLang.filter(([langRegExp]) => {
        return tags.some(tag => langRegExp.test(tag));
    });
    if (targetLangs.length === 0) {
        return null;
    }
    const selectedLang = targetLangs[0];
    return selectedLang[1];
};
/**
 *
 * @param context
 * @param {Object} [config]
 */
function reporter(context, config = {}) {
    const preferLang = config.lang;
    const {Syntax, RuleError, report, fixer, getSource} = context;
    if (typeof Intl === "undefined") {
        throw new Error("Not support your Node.js/browser. should be use latest version.");
    }
    return {
        [Syntax.Str](node){
            const text = getSource(node);
            const chronoDate = chrono.parse(text);
            chronoDate.forEach(chronoDate => {
                const lang = detectLang(Object.keys(chronoDate.tags), preferLang);
                if (!lang) {
                    // not found lang
                    return;
                }
                // get weekday from actual date string
                const kV = chronoDate.start.knownValues;
                const $moment = moment(`${kV.year}-${kV.month}-${kV.day}`, "YYYY-MM-DD", lang);
                if (!$moment.isValid()) {
                    return;
                }
                const slicedText = text.slice(chronoDate.index);
                // (match) or （match）
                const match = slicedText.match(/\s*?([(（])([^(（)]+)([)）])/);
                if (!match) {
                    return;
                }
                const actualDateText = match[0];
                const actualTextAll = `${chronoDate.text}${actualDateText}`;
                const pairStartSymbol = match[1];// (
                const pairEndSymbol = match[3]; // )
                const maybeWeekdayText = match[2].trim(); // weekday
                // 2016年12月30日                  (金曜日)
                //       ^               ^        ^
                // chronoDate.index  match.index  pairStartSymbol.length
                const paddingIndex = chronoDate.index + match.index + pairStartSymbol.length;
                // format http://momentjs.com/docs/#/parsing/string-format/
                const weekdayPatterns = [
                    // date-format , symbols
                    ["dd", moment.localeData(lang).weekdaysMin()],
                    ["ddd", moment.localeData(lang).weekdaysShort()],
                    ["dddd", moment.localeData(lang).weekdays()]
                ];
                weekdayPatterns.forEach(([format, symbols]) => {
                    if (symbols.indexOf(maybeWeekdayText) === -1) {
                        return;
                    }
                    // e.g.) "Friday"
                    const expectedWeekday = $moment.format(format);
                    if (maybeWeekdayText !== expectedWeekday) {
                        const fix = fixer.replaceTextRange(
                            [paddingIndex, paddingIndex + expectedWeekday.length],
                            expectedWeekday
                        );
                        report(node, new RuleError(`${actualTextAll} mismatch weekday.\n${actualTextAll} => ${chronoDate.text}${pairStartSymbol}${expectedWeekday}${pairEndSymbol}`, {
                            index: paddingIndex,
                            fix
                        }));
                    }
                });
            });
        }
    };
}
module.exports = {
    linter: reporter,
    fixer: reporter
};