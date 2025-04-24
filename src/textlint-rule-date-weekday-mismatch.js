// MIT © 2016 azu
"use strict";
const chrono = require("chrono-node");
const moment = require('moment');
/**
 * from chrono tags
 * TODO: get more primitive way
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
 * text should be includes number
 * @param {Object} chronoDate
 * @returns {boolean}
 */
const textIncludesNumber = (chronoDate) => {
    return /[0-9０-９]/.test(chronoDate.text);
};
const yearMonthDayShouldKnownValues = (chronoDate) => {
    if (!chronoDate.start) {
        return false;
    }
    // year-month-day should known value
    // if have not anyone, not report as error
    const kV = chronoDate.start.knownValues;
    return kV.year !== undefined && kV.month !== undefined && kV.day !== undefined;
};
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
 * Add current year to date string if missing.
 * @param {string} dateText
 * @param {number} year
 * @param {string} lang
 * @returns {string}
 */
const addYearToDateText = (dateText, year, lang) => {
    // Japanese: 4月23日(月) → 2024年4月23日(月)
    if (lang === "ja") {
        return `${year}年${dateText}`;
    }
    // Slash: 4/23(月) → 2024/4/23(月)
    if (/^[0-9]{1,2}\/[0-9]{1,2}/.test(dateText)) {
        return `${year}/${dateText}`;
    }
    // Dash: 4-23(Mon) → 2024-4-23(Mon)
    if (/^[0-9]{1,2}-[0-9]{1,2}/.test(dateText)) {
        return `${year}-${dateText}`;
    }
    // Default: prepend year and a space
    return `${year} ${dateText}`;
}
/**
 * Create chronoDates array, optionally supplementing year if needed.
 * @param {string} text
 * @param {Object} options
 * @param {string} options.preferLang
 * @param {boolean} options.useCurrentYearIfMissing
 * @param {number} options.currentYear
 * @returns {Array}
 */
function createChronoDates(text, options) {
    const { preferLang, useCurrentYearIfMissing, currentYear } = options;
    const chronoDates = chrono.parse(text);
    if (!useCurrentYearIfMissing) {
        return chronoDates;
    }
    chronoDates.forEach(chronoDate => {
        // If year is not specified in the parsed result
        if (
            chronoDate.start &&
            chronoDate.start.knownValues.year === undefined
        ) {
            // Detect language for the date string
            const lang = detectLang(Object.keys(chronoDate.tags), preferLang);
            if (!lang) {
                return;
            }
            // Re-parse the text with the year added (using currentYear)
            const newText = addYearToDateText(chronoDate.text, currentYear, lang);
            const reparsed = chrono.parse(newText, undefined, {forwardDate: true});
            // If reparsed successfully, update knownValues with year/month/day
            if (reparsed && reparsed[0] && reparsed[0].start && reparsed[0].start.knownValues) {
                Object.assign(chronoDate.start.knownValues, reparsed[0].start.knownValues);
            }
        }
    });
    return chronoDates;
}
/**
 *
 * @param context
 * @param {Object} [config]
 */
function reporter(context, config = {}) {
    const preferLang = config.lang;
    const useCurrentYearIfMissing = config.useCurrentYearIfMissing;
    const currentYearOption = config.currentYear;
    const {Syntax, RuleError, report, fixer, getSource} = context;
    if (typeof Intl === "undefined") {
        throw new Error("Not support your Node.js/browser. should be use latest version.");
    }

    return {
        [Syntax.Str](node){
            const text = getSource(node);
            // Use helper function to create chronoDates
            const currentYear = currentYearOption ?? (new Date()).getFullYear();
            const chronoDates = createChronoDates(text, {
                preferLang,
                useCurrentYearIfMissing,
                currentYear
            });
            // ignore "今日" text
            // ignore not valid data
            const filteredChronoDates = chronoDates.filter(textIncludesNumber).filter(yearMonthDayShouldKnownValues);
            filteredChronoDates.forEach(chronoDate => {
                const lang = detectLang(Object.keys(chronoDate.tags), preferLang);
                if (!lang) {
                    // not found lang
                    return;
                }
                // get weekday from actual date string
                const kV = chronoDate.start.knownValues;
                let $moment;
                try {
                    $moment = moment(`${kV.year}-${kV.month}-${kV.day}`, "YYYY-MM-DD", lang);
                } catch (error) {
                    report(node, new RuleError(`Maybe textlint-rule-date-weekday-mismatch options was wrong language. lang: ${lang}`));
                    // parse error is ignore
                    return;
                }
                if (!$moment.isValid()) {
                    return;
                }
                // get (weekday)
                const startOfPairSymbol = chronoDate.text.length + chronoDate.index;
                const slicedText = text.slice(startOfPairSymbol);
                // (match) or （match）
                const match = slicedText.match(/^(\s*?[(（])([^(（)]+)([)）])/);
                if (!match) {
                    return;
                }
                const actualDateText = match[0];
                const actualTextAll = `${chronoDate.text}${actualDateText}`;
                const pairStartSymbol = match[1];// ( and padding-left
                const pairEndSymbol = match[3]; // )
                const maybeWeekdayText = match[2].trim(); // weekday
                // 2016年12月30日                  (金曜日)
                //       ^               ^        ^
                // chronoDate.index  match.index  pairStartSymbol.length
                const paddingIndex = startOfPairSymbol + match.index + pairStartSymbol.length;
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
                            [paddingIndex, paddingIndex + maybeWeekdayText.length],
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
