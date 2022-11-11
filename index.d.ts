import EventEmitter from "events";

export type SupportedLexer = "HandlebarsLexer" | "HTMLLexer" | "JavascriptLexer" | "JsxLexer" | "VueLexer";

// BaseLexer is not importable therefore this is the best if done simple
export class CustomLexerClass extends EventEmitter {}
export type CustomLexer = typeof CustomLexerClass;

export interface CustomLexerConfig extends Record<string, unknown> {
  lexer: CustomLexer;
}

export interface HandlebarsLexerConfig {
  lexer: "HandlebarsLexer";
  functions?: string[];
}

export interface HTMLLexerConfig {
  lexer: "HTMLLexer";
  functions?: string[];
  attr?: string;
  optionAttr?: string;
}

export interface JavascriptLexerConfig {
  lexer: "JavascriptLexer";
  functions?: string[];
  namespaceFunctions?: string[];
  attr?: string;
  parseGenerics?: false;
  typeMap?: Record<string, unknown>;
}

export interface JavascriptWithTypesLexerConfig {
  lexer: "JavascriptLexer";
  functions?: string[];
  namespaceFunctions?: string[];
  attr?: string;
  parseGenerics: true;
  typeMap: Record<string, unknown>;
}

export interface JsxLexerConfig {
  lexer: "JsxLexer";
  functions?: string[];
  namespaceFunctions?: string[];
  attr?: string;
  transSupportBasicHtmlNodes?: boolean;
  transKeepBasicHtmlNodesFor?: string[];
  parseGenerics?: false;
  typeMap?: Record<string, unknown>;
}

export interface JsxWithTypesLexerConfig {
  lexer: "JsxLexer";
  functions?: string[];
  namespaceFunctions?: string[];
  attr?: string;
  transSupportBasicHtmlNodes?: boolean;
  transKeepBasicHtmlNodesFor?: string[];
  parseGenerics: true;
  typeMap: Record<string, unknown>;
}

export interface VueLexerConfig {
  lexer: "VueLexer";
  functions?: string[];
}

export type LexerConfig =
  | HandlebarsLexerConfig
  | HTMLLexerConfig
  | JavascriptLexerConfig
  | JavascriptWithTypesLexerConfig
  | JsxLexerConfig
  | JsxWithTypesLexerConfig
  | VueLexerConfig
  | CustomLexerConfig;

export interface UserConfig {
  contextSeparator?: string;
  createOldCatalogs?: boolean;
  defaultNamespace?: string;
  defaultValue?: string | ((locale?: string, namespace?: string, key?: string) => string);
  indentation?: number;
  keepRemoved?: boolean;
  keySeparator?: string | false;
  lexers?: {
    hbs?: (SupportedLexer | CustomLexer | LexerConfig)[];
    handlebars?: (SupportedLexer | CustomLexer | LexerConfig)[];
    htm?: (SupportedLexer | CustomLexer | LexerConfig)[];
    html?: (SupportedLexer | CustomLexer | LexerConfig)[];
    mjs?: (SupportedLexer | CustomLexer | LexerConfig)[];
    js?: (SupportedLexer | CustomLexer | LexerConfig)[];
    ts?: (SupportedLexer | CustomLexer | LexerConfig)[];
    jsx?: (SupportedLexer | CustomLexer | LexerConfig)[];
    tsx?: (SupportedLexer | CustomLexer | LexerConfig)[];
    default?: (SupportedLexer | CustomLexer | LexerConfig)[];
  };
  lineEnding?: "auto" | "crlf" | "\r\n" | "cr" | "\r" | "lf" | "\n";
  locales?: string[];
  namespaceSeparator?: string | false;
  output?: string;
  pluralSeparator?: string;
  input?: string | string[];
  sort?: boolean | ((a: string, b: string) => -1 | 0 | 1);
  skipDefaultValues?: boolean | ((locale?: string, namespace?: string) => boolean);
  useKeysAsDefaultValue?: boolean | ((locale?: string, namespace?: string) => boolean);
  verbose?: boolean;
  failOnWarnings?: boolean;
  failOnUpdate?: boolean;
  customValueTemplate?: Record<string, string> | null;
  resetDefaultValueLocale?: string | null;
  i18nextOptions?: Record<string, unknown> | null;
  yamlOptions?: Record<string, unknown> | null;
}
