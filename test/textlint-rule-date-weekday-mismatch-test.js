const TextLintTester = require("textlint-tester");
const tester = new TextLintTester();
// rule
const rule = require("../src/textlint-rule-date-weekday-mismatch");
// ruleName, rule, { valid, invalid }
tester.run("rule", rule, {
    valid: [
        "2016年12月29日(木)",
        "2016年12月29日(木曜日)",
        "2016-12-29(Thursday)",
        "2016-12-29(Tsu)",
        // invalid date should be ignored
        "11月 25日 (火曜日) "
    ],
    invalid: [
        // single match
        {
            text: "2016年12月29日(月)",
            output: "2016年12月29日(木)",
            errors: [
                {
                    message: "2016年12月29日(月) mismatch weekday.\n2016年12月29日(月) => 2016年12月29日(木)",
                    line: 1,
                    column: 13
                }
            ]
        },
        {
            text: "2017年1月1日(火)",
            output: "2017年1月1日(日)",
            errors: [
                {
                    message: "2017年1月1日(火) mismatch weekday.\n2017年1月1日(火) => 2017年1月1日(日)",
                    line: 1,
                    column: 11
                }
            ]
        },
        {
            text: "Welcome to 2016-12-29(Fri)",
            output: "Welcome to 2016-12-29(Thu)",
            errors: [
                {
                    message: "2016-12-29(Fri) mismatch weekday.\n2016-12-29(Fri) => 2016-12-29(Thu)",
                    line: 1,
                    column: 23
                }
            ]
        },
        // options
        {
            text: "2016-12-29(月)",
            output: "2016-12-29(木)",
            options: {
                lang: "ja-JP"
            },
            errors: [
                {
                    message: "2016-12-29(月) mismatch weekday.\n2016-12-29(月) => 2016-12-29(木)",
                    line: 1,
                    column: 12
                }
            ]
        },
        {
            text: "2016年12月29日（月曜日）",
            output: "2016年12月29日（木曜日）",
            errors: [
                {
                    message: "2016年12月29日（月曜日） mismatch weekday.\n2016年12月29日（月曜日） => 2016年12月29日（木曜日）",
                    line: 1,
                    column: 13
                }
            ]
        },
        // multiple match
        {
            text: `
2016年12月29日(月)
2016年12月29日(月曜日)
`.trim(),
            errors: [
                {
                    message: "2016年12月29日(月) mismatch weekday.\n2016年12月29日(月) => 2016年12月29日(木)",
                    line: 1,
                    column: 13
                },
                {
                    message: "2016年12月29日(月曜日) mismatch weekday.\n2016年12月29日(月曜日) => 2016年12月29日(木曜日)",
                    line: 2,
                    column: 13
                }
            ]
        },

    ]
});