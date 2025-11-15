// src/lib/receipt/registry.ts
import { ParserRegistry } from "./parser"
import { GenericParser } from "./parsers/generic"
import { SevenElevenParser } from "./parsers/seven"

export const registry = new ParserRegistry([new SevenElevenParser(), new GenericParser()])
