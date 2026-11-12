import type { IR } from "@hey-api/shared";
import { classifyBody, isSchemaObject, type Schema } from "@ir-kit/openapi";
import {
  type GoFuncParam,
  type GoStmt,
  goAssign,
  goCall,
  goExprStmt,
  goIdent,
  goIf,
  goIntLit,
  goNe,
  goNil,
  goRef,
  goSelector,
  goShort,
  goStr,
  goStructLit,
} from "../../ast/index.js";
import { paramIdent } from "../identifiers.js";
import type { ErrCheckFn } from "./errors.js";
import { paramValue } from "./param-value.js";

export interface BodyResult {
  stmts: ReadonlyArray<GoStmt>;
  /** True when the body builder produced multipart code; the
   *  orchestrator uses this to decide whether to ship the runtime
   *  helper. */
  needsMultipart: boolean;
}

/**
 * Build the request body and re-set `req.Body` / `req.ContentLength`
 * / `Content-Type` in place. Dispatches on media type:
 *
 *  - `application/json` (and `+json`) → `payload, err := json.Marshal(body)`,
 *    set body to `bytes.NewReader(payload)`. For opaque bodies
 *    (`oneOf`/`anyOf`), the impl receives `body []byte` and ships it raw.
 *  - `multipart/form-data` (object schema) → assemble a
 *    `MultipartFormBody`, append text/file fields per property,
 *    take `multipart.Bytes()` as the body.
 *  - `application/x-www-form-urlencoded` (object schema) → build a
 *    `url.Values{}`, set keys per property, encode as the body.
 *  - octet-stream / image / unknown → set body to `bytes.NewReader(body)`.
 *
 * Optional pointer-typed fields are wrapped in `if <id> != nil` and
 * dereferenced inside the guard.
 */
export function buildBodyStmts(
  body: IR.BodyObject,
  errCheck: ErrCheckFn,
  params: ReadonlyArray<GoFuncParam>,
): BodyResult {
  const { shape, schema } = classifyBody(body);
  switch (shape.kind) {
    case "json-opaque":
      return { stmts: rawBytesBody("application/json"), needsMultipart: false };
    case "json-typed":
      return { stmts: jsonBody(errCheck), needsMultipart: false };
    case "multipart-object":
      return { stmts: multipartBody(schema, params), needsMultipart: true };
    case "form-urlencoded-object":
      return {
        stmts: formUrlEncodedBody(schema, params),
        needsMultipart: false,
      };
    case "opaque":
      return {
        stmts: rawBytesBody(
          (body.mediaType ?? "").toLowerCase() || "application/octet-stream",
        ),
        needsMultipart: false,
      };
  }
}

function setBodyAndContentType(payloadIdent: string, mt: string): GoStmt[] {
  return [
    goAssign(
      [goSelector(goIdent("req"), "Body")],
      [
        goCall(goSelector(goIdent("io"), "NopCloser"), [
          {
            expr: goCall(goSelector(goIdent("bytes"), "NewReader"), [
              { expr: goIdent(payloadIdent) },
            ]),
          },
        ]),
      ],
    ),
    goAssign(
      [goSelector(goIdent("req"), "ContentLength")],
      [
        goCall(goIdent("int64"), [
          { expr: goCall(goIdent("len"), [{ expr: goIdent(payloadIdent) }]) },
        ]),
      ],
    ),
    goExprStmt(
      goCall(goSelector(goSelector(goIdent("req"), "Header"), "Set"), [
        { expr: goStr("Content-Type") },
        { expr: goStr(mt) },
      ]),
    ),
  ];
}

function jsonBody(errCheck: ErrCheckFn): GoStmt[] {
  return [
    goShort(
      ["payload", "err"],
      [
        goCall(goSelector(goIdent("json"), "Marshal"), [
          { expr: goIdent("body") },
        ]),
      ],
    ),
    errCheck("encoding"),
    ...setBodyAndContentType("payload", "application/json"),
  ];
}

function rawBytesBody(mt: string): GoStmt[] {
  return setBodyAndContentType("body", mt);
}

function multipartBody(
  schema: Schema,
  params: ReadonlyArray<GoFuncParam>,
): GoStmt[] {
  const required = new Set(schema.required ?? []);
  const stmts: GoStmt[] = [
    goShort(["multipart"], [goCall(goIdent("NewMultipartFormBody"), [])]),
  ];
  for (const [propName, propSchema] of Object.entries(
    schema.properties ?? {},
  )) {
    if (!isSchemaObject(propSchema)) continue;
    const id = paramIdent(propName);
    const isBinary =
      propSchema.type === "string" && propSchema.format === "binary";
    const isReq = required.has(propName);
    const ref = paramValue(id, params);
    const append: GoStmt = isBinary
      ? goExprStmt(
          goCall(goSelector(goIdent("multipart"), "AppendFile"), [
            { expr: goStr(propName) },
            { expr: goStr(propName) },
            { expr: ref },
          ]),
        )
      : goExprStmt(
          goCall(goSelector(goIdent("multipart"), "AppendText"), [
            { expr: goStr(propName) },
            {
              expr: goCall(goSelector(goIdent("fmt"), "Sprint"), [
                { expr: ref },
              ]),
            },
          ]),
        );
    stmts.push(isReq ? append : goIf(goNe(goIdent(id), goNil), [append]));
  }
  stmts.push(
    goShort(
      ["payload"],
      [goCall(goSelector(goIdent("multipart"), "Bytes"), [])],
    ),
    goExprStmt(
      goCall(goSelector(goSelector(goIdent("req"), "Header"), "Set"), [
        { expr: goStr("Content-Type") },
        { expr: goCall(goSelector(goIdent("multipart"), "ContentType"), []) },
      ]),
    ),
    goAssign(
      [goSelector(goIdent("req"), "Body")],
      [
        goCall(goSelector(goIdent("io"), "NopCloser"), [
          {
            expr: goCall(goSelector(goIdent("bytes"), "NewReader"), [
              { expr: goIdent("payload") },
            ]),
          },
        ]),
      ],
    ),
    goAssign(
      [goSelector(goIdent("req"), "ContentLength")],
      [
        goCall(goIdent("int64"), [
          { expr: goCall(goIdent("len"), [{ expr: goIdent("payload") }]) },
        ]),
      ],
    ),
  );
  return stmts;
}

function formUrlEncodedBody(
  schema: Schema,
  params: ReadonlyArray<GoFuncParam>,
): GoStmt[] {
  const required = new Set(schema.required ?? []);
  const stmts: GoStmt[] = [
    goShort(["form"], [goStructLit(goRef("url.Values"), [])]),
  ];
  for (const propName of Object.keys(schema.properties ?? {})) {
    const id = paramIdent(propName);
    const isReq = required.has(propName);
    const ref = paramValue(id, params);
    const set = goExprStmt(
      goCall(goSelector(goIdent("form"), "Set"), [
        { expr: goStr(propName) },
        {
          expr: goCall(goSelector(goIdent("fmt"), "Sprint"), [{ expr: ref }]),
        },
      ]),
    );
    stmts.push(isReq ? set : goIf(goNe(goIdent(id), goNil), [set]));
  }
  stmts.push(
    goShort(
      ["payload"],
      [
        goCall(goIdent("[]byte"), [
          { expr: goCall(goSelector(goIdent("form"), "Encode"), []) },
        ]),
      ],
    ),
  );
  stmts.push(
    ...setBodyAndContentType("payload", "application/x-www-form-urlencoded"),
  );
  return stmts;
}

void goIntLit;
