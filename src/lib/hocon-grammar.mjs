/**
 * A TextMate grammar for HOCON.
 *
 * Shiki does not ship one, so every ```hocon block on a site about HOCON was
 * rendering as plain text. This covers the constructs the documentation
 * actually shows: both comment styles, triple-quoted strings, substitutions
 * including the optional form, includes with their qualifiers, and the
 * duration and byte-size units that are part of the language.
 *
 * Ordering matters. Comments come first so that a `//` inside a `#` comment
 * cannot start a second comment — the exact bug that made another HOCON
 * library swallow the line after a comment.
 */
export const hoconGrammar = {
  name: 'hocon',
  scopeName: 'source.hocon',
  patterns: [{ include: '#expression' }],
  repository: {
    expression: {
      patterns: [
        { include: '#comment' },
        { include: '#include' },
        { include: '#triple-quoted-string' },
        { include: '#string' },
        { include: '#substitution' },
        { include: '#constant' },
        { include: '#number' },
        { include: '#key' },
        { include: '#operator' },
        { include: '#punctuation' },
      ],
    },

    comment: {
      patterns: [
        {
          name: 'comment.line.number-sign.hocon',
          begin: '#',
          end: '$',
        },
        {
          name: 'comment.line.double-slash.hocon',
          begin: '//',
          end: '$',
        },
      ],
    },

    include: {
      name: 'meta.include.hocon',
      begin: '\\b(include)\\b',
      beginCaptures: { 1: { name: 'keyword.control.include.hocon' } },
      end: '$',
      patterns: [
        {
          name: 'keyword.other.include-qualifier.hocon',
          match: '\\b(required|file|url|classpath)\\b',
        },
        { include: '#string' },
        { include: '#punctuation' },
        { include: '#comment' },
      ],
    },

    'triple-quoted-string': {
      name: 'string.quoted.triple.hocon',
      begin: '"""',
      end: '"""',
    },

    string: {
      name: 'string.quoted.double.hocon',
      begin: '"',
      end: '"',
      patterns: [
        {
          name: 'constant.character.escape.hocon',
          match: '\\\\(u[0-9a-fA-F]{4}|["\\\\/bfnrt])',
        },
      ],
    },

    substitution: {
      name: 'meta.substitution.hocon',
      begin: '(\\$\\{)(\\?)?',
      beginCaptures: {
        1: { name: 'punctuation.definition.substitution.begin.hocon' },
        2: { name: 'keyword.operator.optional.hocon' },
      },
      end: '\\}',
      endCaptures: { 0: { name: 'punctuation.definition.substitution.end.hocon' } },
      contentName: 'variable.other.substitution.hocon',
    },

    constant: {
      name: 'constant.language.hocon',
      match: '\\b(true|false|yes|no|on|off|null)\\b',
    },

    number: {
      patterns: [
        {
          // Durations and byte sizes are part of the language, so the unit is
          // highlighted as a unit rather than as a stray identifier.
          name: 'constant.numeric.with-unit.hocon',
          match:
            '(?<![\\w.-])[0-9]+(?:\\.[0-9]+)?\\s*(?:ns|nanos|nanoseconds|us|micros|microseconds|ms|millis|milliseconds|s|seconds|m|minutes|h|hours|d|days|weeks|months|years|[KMGTPE]?i?[Bb]?)(?![\\w.-])',
        },
        {
          name: 'constant.numeric.hocon',
          match: '(?<![\\w.-])-?[0-9]+(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?(?![\\w.-])',
        },
      ],
    },

    key: {
      // A bare word that is followed by an assignment or an object is a key.
      // Anything else is an unquoted string value, which HOCON allows and
      // which should not be coloured as a key.
      name: 'variable.other.key.hocon',
      match: '(?:^|[{,])\\s*([A-Za-z0-9_][A-Za-z0-9_.\\-]*)(?=\\s*[:={+])',
      captures: { 1: { name: 'support.type.property-name.hocon' } },
    },

    operator: {
      name: 'keyword.operator.assignment.hocon',
      match: '\\+=|=|:',
    },

    punctuation: {
      name: 'punctuation.hocon',
      match: '[{}\\[\\],]',
    },
  },
};
