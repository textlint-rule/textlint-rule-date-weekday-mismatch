import TextLintTester from "textlint-tester";

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
        // real example
        `今回で192回目の更新ですが、このままのペースだと11月10日(月)に200回目となるので、
それを記念して勉強会的なイベントをやろうかと思ってます。

詳細は(まだ詳細は決まってない)以下に書いてありますが、2014年11月09日(日)を予定しています。`,
        // invalid date should be ignored
        "11月 25日 (火曜日) ",
        // ignore relative word
        "今日(火曜日)はどうしよう",
        // useCurrentYearIfMissing option: valid
        {
            text: "4月23日(水)",
            options: { useCurrentYearIfMissing: true, currentYear: 2025, lang: "ja" },
            // 2025年4月23日は水曜日
        },
        {
            text: "4/23(Wed)",
            options: { useCurrentYearIfMissing: true, currentYear: 2025, lang: "en" },
            // 2025-04-23 is Wednesday
        },
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
            text: "2021-07-02 (Thursday)",
            output: "2021-07-02 (Friday)",
            errors: [
                {
                    message: "2021-07-02 (Thursday) mismatch weekday.\n2021-07-02 (Thursday) => 2021-07-02 (Friday)",
                    line: 1,
                    column: 13
                }
            ]
        },
        {
            text: "2017年1月1日 (火)",
            output: "2017年1月1日 (日)",
            errors: [
                {
                    message: "2017年1月1日 (火) mismatch weekday.\n2017年1月1日 (火) => 2017年1月1日 (日)",
                    line: 1,
                    column: 12
                }
            ]
        },
        {
            text: "2016年12月30日〜2017年1月1日(火)",
            output: "2016年12月30日〜2017年1月1日(日)",
            errors: [
                {
                    message: "2017年1月1日(火) mismatch weekday.\n2017年1月1日(火) => 2017年1月1日(日)",
                    line: 1,
                    column: 23
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
        // useCurrentYearIfMissing option: invalid
        {
            text: "4月23日(金)",
            output: "4月23日(水)",
            options: { useCurrentYearIfMissing: true, currentYear: 2025, lang: "ja" },
            errors: [
                {
                    message: "4月23日(金) mismatch weekday.\n4月23日(金) => 4月23日(水)",
                    line: 1,
                    column: 7
                }
            ]
        },
        {
            text: "4/23(Fri)",
            output: "4/23(Wed)",
            options: { useCurrentYearIfMissing: true, currentYear: 2025, lang: "en" },
            errors: [
                {
                    message: "4/23(Fri) mismatch weekday.\n4/23(Fri) => 4/23(Wed)",
                    line: 1,
                    column: 6
                }
            ]
        },
    ]
});
