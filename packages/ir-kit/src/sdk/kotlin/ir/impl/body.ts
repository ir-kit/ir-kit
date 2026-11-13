import type { IR } from "../../../../ir/index.js";
import type { HttpMethod, Schema } from "../../../../openapi/index.js";
import { classifyBody, isSchemaObject } from "../../../../openapi/index.js";
import type { KtType } from "../../ast/index.js";
import {
  type KtExpr,
  type KtStmt,
  ktArg,
  ktCall,
  ktExprStmt,
  ktIdent,
  ktIf,
  ktInterp,
  ktMember,
  ktNe,
  ktNull,
  ktStr,
  ktVal,
} from "../../ast/index.js";
import { operationParamIdent } from "../identifiers.js";
import { setMethodWithBody } from "./request.js";
import { type SerializerAliases, serializerFor } from "./serializer.js";

export interface BodyResult {
  stmts: ReadonlyArray<KtStmt>;
  /** Set when the body builder uses `MultipartFormBody` so the
   *  orchestrator emits that runtime helper. */
  needsMultipart: boolean;
}

/**
 * Build the request body and re-set the HTTP method on `builder` to
 * carry it. Dispatches on media type:
 *
 *  - `application/json` (and `+json`) →
 *    `client.json.encodeToString(<ser>, body)` then
 *    `.toRequestBody("application/json".toMediaType())`. Opaque
 *    schemas: impl receives `body: ByteArray` and ships it raw.
 *  - `multipart/form-data` + object → assemble a `MultipartFormBody`,
 *    `appendText` / `appendFile` per property, take `.build()`.
 *  - `application/x-www-form-urlencoded` + object → `FormBody.Builder()`
 *    + `add(name, value)` per property + `.build()`.
 *  - octet-stream / image / etc. → `body.toRequestBody("<mt>".toMediaType())`.
 *
 * Optional fields are wrapped in `if (<id> != null)`.
 */
export function buildBodyStmts(
  body: IR.Body,
  method: HttpMethod,
  bodyType: KtType,
  aliases: SerializerAliases,
): BodyResult {
  const { shape, schema } = classifyBody(body);
  switch (shape.kind) {
    case "json-opaque":
      return {
        stmts: [emitMethodWithRawBody(method, "application/json")],
        needsMultipart: false,
      };
    case "json-typed":
      return {
        stmts: emitJsonBody(method, bodyType, aliases),
        needsMultipart: false,
      };
    case "multipart-object":
      return { stmts: emitMultipartBody(schema, method), needsMultipart: true };
    case "form-urlencoded-object":
      return {
        stmts: emitFormUrlEncodedBody(schema, method),
        needsMultipart: false,
      };
    case "opaque":
      return {
        stmts: [
          emitMethodWithRawBody(
            method,
            (body.mediaType ?? "").toLowerCase() || "application/octet-stream",
          ),
        ],
        needsMultipart: false,
      };
  }
}

const TO_REQUEST_BODY = "toRequestBody";

function toMediaTypeCall(mt: string): KtExpr {
  return ktCall(ktMember(ktStr(mt), "toMediaType"), []);
}

function emitJsonBody(
  method: HttpMethod,
  bodyType: KtType,
  aliases: SerializerAliases,
): KtStmt[] {
  return [
    ktVal(
      "payload",
      ktCall(ktMember(ktMember(ktIdent("client"), "json"), "encodeToString"), [
        ktArg(serializerFor(bodyType, aliases)),
        ktArg(ktIdent("body")),
      ]),
    ),
    setMethodWithBody(
      method,
      ktCall(ktMember(ktIdent("payload"), TO_REQUEST_BODY), [
        ktArg(toMediaTypeCall("application/json")),
      ]),
    ),
  ];
}

function emitMethodWithRawBody(method: HttpMethod, mt: string): KtStmt {
  return setMethodWithBody(
    method,
    ktCall(ktMember(ktIdent("body"), TO_REQUEST_BODY), [
      ktArg(toMediaTypeCall(mt)),
    ]),
  );
}

function emitMultipartBody(schema: Schema, method: HttpMethod): KtStmt[] {
  return emitFieldBody(
    schema,
    method,
    "multipart",
    "MultipartFormBody",
    (propName, propSchema, id) => {
      if (!isSchemaObject(propSchema)) return undefined;
      const isBinary =
        propSchema.type === "string" && propSchema.format === "binary";
      return isBinary
        ? ktCall(ktMember(ktIdent("multipart"), "appendFile"), [
            ktArg(ktStr(propName)),
            ktArg(ktStr(propName)),
            ktArg(ktIdent(id)),
          ])
        : ktCall(ktMember(ktIdent("multipart"), "appendText"), [
            ktArg(ktStr(propName)),
            ktArg(ktInterp([ktIdent(id)])),
          ]);
    },
  );
}

function emitFormUrlEncodedBody(schema: Schema, method: HttpMethod): KtStmt[] {
  return emitFieldBody(
    schema,
    method,
    "formBuilder",
    "FormBody.Builder",
    (propName, _, id) =>
      ktCall(ktMember(ktIdent("formBuilder"), "add"), [
        ktArg(ktStr(propName)),
        ktArg(ktInterp([ktIdent(id)])),
      ]),
  );
}

/**
 * Append each property to a `builder` val, guarding optional ones with a
 * null check, then send `builder.build()` as the request body.
 */
function emitFieldBody(
  schema: Schema,
  method: HttpMethod,
  builder: string,
  builderCtor: string,
  append: (
    propName: string,
    propSchema: NonNullable<Schema["properties"]>[string],
    id: string,
  ) => KtExpr | undefined,
): KtStmt[] {
  const required = new Set(schema.required ?? []);
  const stmts: KtStmt[] = [ktVal(builder, ktCall(ktIdent(builderCtor), []))];
  for (const [propName, propSchema] of Object.entries(
    schema.properties ?? {},
  )) {
    const id = operationParamIdent(propName);
    const call = append(propName, propSchema, id);
    if (!call) continue;
    const stmt = ktExprStmt(call);
    stmts.push(
      required.has(propName) ? stmt : ktIf(ktNe(ktIdent(id), ktNull), [stmt]),
    );
  }
  stmts.push(
    setMethodWithBody(method, ktCall(ktMember(ktIdent(builder), "build"), [])),
  );
  return stmts;
}
