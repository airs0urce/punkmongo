module.exports = {
    locales: {
        default: '?',
        description: '?',
        values: [
            {value: 'simple', text: 'Simple binary comparison'},
            {value: 'af', text: 'Afrikaans'},
            {value: 'sq', text: 'Albanian'},
            {value: 'am', text: 'Amharic'},
            {value: 'ar', text: 'Arabic'},
            {value: 'hy', text: 'Armenian'},
            {value: 'as', text: 'Assamese'},
            {value: 'az', text: 'Azeri'},
            {value: 'bn', text: 'Bengali'},
            {value: 'be', text: 'Belarusian'},
            {value: 'bn', text: 'Bengali'},
            {value: 'bs', text: 'Bosnian'},
            {value: 'bs_Cyrl', text: 'Bosnian (Cyrillic)'},
            {value: 'bg', text: 'Bulgarian'},
            {value: 'my', text: 'Burmese'},
            {value: 'ca', text: 'Catalan'},
            {value: 'chr', text: 'Cherokee'},
            {value: 'zh', text: 'Chinese'},
            {value: 'zh_Hant', text: 'Chinese (Traditional)'},
            {value: 'hr', text: 'Croatian'},
            {value: 'cs', text: 'Czech'},
            {value: 'da', text: 'Danish'},
            {value: 'nl', text: 'Dutch'},
            {value: 'dz', text: 'Dzongkha'},
            {value: 'en', text: 'English'},
            {value: 'en_US', text: 'English (United States)'},
            {value: 'en_US_POSIX', text: 'English (United States, Computer)'},
            {value: 'eo', text: 'Esperanto'},
            {value: 'et', text: 'Estonian'},
            {value: 'ee', text: 'Ewe'},
            {value: 'fo', text: 'Faroese'},
            {value: 'fil', text: 'Filipino'},
            {value: 'fi', text: 'Finnish'},
            {value: 'fr', text: 'French'},
            {value: 'fr_CA', text: 'French (Canada)'},
            {value: 'gl', text: 'Galician'},
            {value: 'ka', text: 'Georgian'},
            {value: 'de', text: 'German'},
            {value: 'de_AT', text: 'German (Austria)'},
            {value: 'el', text: 'Greek'},
            {value: 'gu', text: 'Gujarati'},
            {value: 'ha', text: 'Hausa'},
            {value: 'haw', text: 'Hawaiian'},
            {value: 'he', text: 'Hebrew'},
            {value: 'hi', text: 'Hindi'},
            {value: 'hu', text: 'Hungarian'},
            {value: 'is', text: 'Icelandic'},
            {value: 'ig', text: 'Igbo'},
            {value: 'smn', text: 'Inari Sami'},
            {value: 'id', text: 'Indonesian'},
            {value: 'ga', text: 'Irish'},
            {value: 'it', text: 'Italian'},
            {value: 'ja', text: 'Japanese'},
            {value: 'kl', text: 'Kalaallisut'},
            {value: 'kn', text: 'Kannada'},
            {value: 'kk', text: 'Kazakh'},
            {value: 'km', text: 'Khmer'},
            {value: 'kok', text: 'Konkani'},
            {value: 'ko', text: 'Korean'},
            {value: 'ky', text: 'Kyrgyz'},
            {value: 'lkt', text: 'Lakota'},
            {value: 'lo', text: 'Lao'},
            {value: 'lv', text: 'Latvian'},
            {value: 'ln', text: 'Lingala'},
            {value: 'lt', text: 'Lithuanian'},
            {value: 'dsb', text: 'Lower Sorbian'},
            {value: 'lb', text: 'Luxembourgish'},
            {value: 'mk', text: 'Macedonian'},
            {value: 'ms', text: 'Malay'},
            {value: 'ml', text: 'Malayalam'},
            {value: 'mt', text: 'Maltese'},
            {value: 'mr', text: 'Marathi'},
            {value: 'mn', text: 'Mongolian'},
            {value: 'ne', text: 'Nepali'},
            {value: 'se', text: 'Northern Sami'},
            {value: 'nb', text: 'Norwegian Bokmål'},
            {value: 'nn', text: 'Norwegian Nynorsk'},
            {value: 'or', text: 'Oriya'},
            {value: 'om', text: 'Oromo'},
            {value: 'ps', text: 'Pashto'},
            {value: 'fa', text: 'Persian'},
            {value: 'fa_AF', text: 'Persian (Afghanistan)'},
            {value: 'pl', text: 'Polish'},
            {value: 'pt', text: 'Portuguese'},
            {value: 'pa', text: 'Punjabi'},
            {value: 'ro', text: 'Romanian'},
            {value: 'ru', text: 'Russian'},
            {value: 'sr', text: 'Serbian'},
            {value: 'sr_Latn', text: 'Serbian (Latin)'},
            {value: 'si', text: 'Sinhala'},
            {value: 'sk', text: 'Slovak'},
            {value: 'sl', text: 'Slovenian'},
            {value: 'es', text: 'Spanish'},
            {value: 'sw', text: 'Swahili'},
            {value: 'sv', text: 'Swedish'},
            {value: 'ta', text: 'Tamil'},
            {value: 'te', text: 'Telugu'},
            {value: 'th', text: 'Thai'},
            {value: 'bo', text: 'Tibetan'},
            {value: 'to', text: 'Tongan'},
            {value: 'tr', text: 'Turkish'},
            {value: 'uk', text: 'Ukrainian'},
            {value: 'hsb', text: 'Upper Sorbian'},
            {value: 'ur', text: 'Urdu'},
            {value: 'ug', text: 'Uyghur'},
            {value: 'vi', text: 'Vietnamese'},
            {value: 'wae', text: 'Walser'},
            {value: 'cy', text: 'Welsh'},
            {value: 'yi', text: 'Yiddish'},
            {value: 'yo', text: 'Yoruba'},
            {value: 'zu', text: 'Zulu'},
        ]
    },
    strength: {
        default: 3,
        description: '?',
        values: [
            {value: 1, text: `Primary level of comparison. Collation performs comparisons of the base characters only, ignoring other differences such as diacritics and case.`},
            {value: 2, text: `Secondary level of comparison. Collation performs comparisons up to secondary differences, such as diacritics. That is, collation performs comparisons of base characters (primary differences) and diacritics (secondary differences). Differences between base characters takes precedence over secondary differences.`},
            {value: 3, text: `Tertiary level of comparison. Collation performs comparisons up to tertiary differences, such as case and letter variants. That is, collation performs comparisons of base characters (primary differences), diacritics (secondary differences), and case and variants (tertiary differences). Differences between base characters takes precedence over secondary differences, which takes precedence over tertiary differences. This is the default level.`},
            {value: 4, text: `Quaternary Level. Limited for specific use case to consider punctuation when levels 1-3 ignore punctuation or for processing Japanese text.`},
            {value: 5, text: `Identical Level. Limited for specific use case of tie breaker.`},
        ]
    },
    caseLevel: {
        default: false,
        description: 'Flag that determines whether to include case comparison at strength level 1 or 2.',
        values: [
            {value: true, text: `When used with strength:1, collation compares base characters and case. When used with strength:2, collation compares base characters, diacritics (and possible other secondary differences) and case.`},
            {value: false, text: `Do not include case comparison at strength level 1 or 2.`}
        ]
    },
    caseFirst: {
        default: 'off',
        values: [
            {value: 'upper', text: 'Uppercase sorts before lowercase.'},
            {value: 'lower', text: 'Lowercase sorts before uppercase.'},
            {value: 'off', text: 'Similar to "lower" with slight differences. See http://userguide.icu-project.org/collation/customization for details of differences.'},
        ]
    },
    numericOrdering: {
        default: false,
        description: '?',
        values: [
            {value: true, text: `compare as numbers; i.e. "10" is greater than "2".`},
            {value: false, text: `compare as strings; i.e. "10" is less than "2".`}
        ]
    },
    alternate: {
        default: 'non-ignorable',
        description: '?',
        values: [
            {value: 'non-ignorable', text: `Whitespace and punctuation are considered base characters.`},
            {value: 'shifted', text: `Whitespace and punctuation are not considered base characters and are only distinguished at strength levels greater than 3.`}
        ]
    },
    maxVariable: {
        default: '?',
        description: 'Field that determines up to which characters are considered ignorable when alternate: "shifted". Has no effect if alternate: "non-ignorable"',
        values: [
            {value: 'punct', text: `Both whitespaces and punctuation are “ignorable”, i.e. not considered base characters.`},
            {value: 'space', text: `Whitespace are “ignorable”, i.e. not considered base characters.`}
        ]  
    },
    backwards: {
        default: false,
        description: 'Flag that determines whether strings with diacritics sort from back of the string, such as with some French dictionary ordering.',
        values: [
            {value: true, text: `compare from back to front.`},
            {value: false, text: `compare from front to back.`}
        ]
    },
    normalization: {
        default: false,
        description: 'Flag that determines whether to check if text require normalization and to perform normalization. Generally, majority of text does not require this normalization processing.',
        values: [
            {value: true, text: `Check if fully normalized and perform normalization to compare text.`},
            {value: false, text: `Do not check.`}
        ]
    }
}











