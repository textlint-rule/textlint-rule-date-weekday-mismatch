# textlint-rule-date-weekday-mismatch [![test](https://github.com/textlint-rule/textlint-rule-date-weekday-mismatch/actions/workflows/test.yml/badge.svg)](https://github.com/textlint-rule/textlint-rule-date-weekday-mismatch/actions/workflows/test.yml)

textlint rule that found mismatch between date and weekday. 

**OK**:

Correct date and weekday.

    2016-12-29(Thursday)
    2016年12月30日(木曜日)

**NG**:

Incorrect date and weekday.

    2016-12-29(Friday)

    // Error:
    2016-12-29(Friday) mismatch weekday.
    2016-12-29(Friday) => 2016-12-29(Thursday)

## Supported lang

Automatically detect language from your text!

- en
- ja(日本語)
- es
- fr
- zh

This rule depended on following library:

- [wanasit/chrono](https://github.com/wanasit/chrono)
- [Moment.js](http://momentjs.com/)

## Install

Install with [npm](https://www.npmjs.com/):

    npm install textlint-rule-date-weekday-mismatch

## Usage

Via `.textlintrc`(Recommended)

```json
{
    "rules": {
        "date-weekday-mismatch": true
    }
}
```

Via CLI

```
textlint --rule date-weekday-mismatch README.md
```

## Options

- `lang`: string
    - Default: none(Automatically detect language)
    - Specify language for date string

```json
{
    "rules": {
        "date-weekday-mismatch": {
            "lang": "ja"
        }
    }
}
```

For example, `2016-12-30` is `en` by default.
But, You can specify `2016-12-30` is `ja-JP` text by options

```json
{
    "rules": {
        "date-weekday-mismatch": {
            "lang": "ja-JP"
        }
    }
}
```

- `useCurrentYearIfMissing`: boolean
    - Default: false
    - If true, when the year is missing in the date string (e.g. `4月23日(月)`), the current year will be automatically added for validation.
    - This is useful for documents that often omit the year in dates.

Example:

```json
{
    "rules": {
        "date-weekday-mismatch": {
            "useCurrentYearIfMissing": true
        }
    }
}
```

If the text contains `4月23日(水)`, and the current year is 2025, it will be interpreted as `2025年4月23日(水)` for the weekday check.

- `currentYear`: number
    - Default: the current year (from system date)
    - If specified, this value will be used as the year when supplementing missing years in date strings (used only when `useCurrentYearIfMissing` is true).
    - This is useful for testing or for documents that should always use a specific year for validation.

Example (using both options):

```json
{
    "rules": {
        "date-weekday-mismatch": {
            "useCurrentYearIfMissing": true,
            "currentYear": 2025
        }
    }
}
```

If the text contains `4月23日(水)`, it will always be interpreted as `2025年4月23日(水)` for the weekday check, regardless of the actual system year.


language format following ISO 639-1.

e.g.) `en-US`, `en`, `ja` etc..

- [ISO 639-1 - Wikipedia](https://en.wikipedia.org/wiki/ISO_639-1 "ISO 639-1 - Wikipedia")
- [Moment.js | Docs](http://momentjs.com/docs/#/i18n/changing-locale/ "Moment.js | Docs")

## Acknowledge

- [日付曜日矛盾 // Speaker Deck](https://speakerdeck.com/shirayu/ri-fu-yao-ri-mao-dun "日付曜日矛盾 // Speaker Deck")

## Changelog

See [Releases page](https://github.com/textlint-rule/textlint-rule-date-weekday-mismatch/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm i -d && npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/textlint-rule/textlint-rule-date-weekday-mismatch/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
