import type { SwDecl, SwType } from "../../ast/index.js";
import {
  swArg,
  swArray,
  swAssign,
  swAssoc,
  swBool,
  swCall,
  swCase,
  swDict,
  swDotCase,
  swDouble,
  swEnum,
  swEnumCase,
  swEnumPattern,
  swExprStmt,
  swFun,
  swIdent,
  swIf,
  swIfLet,
  swInit,
  swJSONValue,
  swLet,
  swMember,
  swRef,
  swReturn,
  swString,
  swSwitch,
  swTry,
  swTryOpt,
  swTypeRef,
  swVar,
  swVoid,
} from "../../ast/index.js";

const CASES: ReadonlyArray<readonly [string, SwType]> = [
  ["string", swString],
  ["number", swDouble],
  ["bool", swBool],
  ["object", swDict(swString, swJSONValue)],
  ["array", swArray(swJSONValue)],
];

/** Decode order: the first type the payload decodes as wins. */
const DECODE_ORDER = ["bool", "number", "string", "array"] as const;

const container = swIdent("container");
const assignSelf = (value: Parameters<typeof swAssign>[1]) =>
  swAssign(swIdent("self"), value);
const caseType = (name: string): SwType => CASES.find(([c]) => c === name)![1];

/**
 * `JSONValue`: a `Codable` enum for schemas that admit any JSON value,
 * so models holding them still synthesize `Codable`.
 */
export function jsonValueDecl(): SwDecl {
  return swEnum({
    name: "JSONValue",
    conforms: ["Codable", "Equatable"],
    cases: [
      ...CASES.map(([name, type]) =>
        swEnumCase(name, undefined, [swAssoc(type)]),
      ),
      swEnumCase("null"),
    ],
    inits: [
      swInit({
        params: [{ name: "decoder", label: "from", type: swRef("Decoder") }],
        memberwise: false,
        throws: true,
        body: [
          swLet(
            "container",
            swTry(swCall(swMember(swIdent("decoder"), "singleValueContainer"))),
          ),
          swIf(swCall(swMember(container, "decodeNil")), [
            assignSelf(swDotCase("null")),
            swReturn(),
          ]),
          ...DECODE_ORDER.map((name) =>
            swIfLet(
              "value",
              swTryOpt(
                swCall(swMember(container, "decode"), [
                  swArg(swTypeRef(caseType(name))),
                ]),
              ),
              [
                assignSelf(swCall(swDotCase(name), [swArg(swIdent("value"))])),
                swReturn(),
              ],
            ),
          ),
          assignSelf(
            swCall(swDotCase("object"), [
              swArg(
                swTry(
                  swCall(swMember(container, "decode"), [
                    swArg(swTypeRef(caseType("object"))),
                  ]),
                ),
              ),
            ]),
          ),
        ],
      }),
    ],
    funs: [
      swFun({
        name: "encode",
        params: [{ name: "encoder", label: "to", type: swRef("Encoder") }],
        returnType: swVoid,
        effects: ["throws"],
        body: [
          swVar(
            "container",
            swCall(swMember(swIdent("encoder"), "singleValueContainer")),
          ),
          swSwitch(swIdent("self"), [
            ...CASES.map(([name]) =>
              swCase(
                [swEnumPattern(name, ["value"])],
                [
                  swExprStmt(
                    swTry(
                      swCall(swMember(container, "encode"), [
                        swArg(swIdent("value")),
                      ]),
                    ),
                  ),
                ],
              ),
            ),
            swCase(
              [swDotCase("null")],
              [swExprStmt(swTry(swCall(swMember(container, "encodeNil"))))],
            ),
          ]),
        ],
      }),
    ],
  });
}
