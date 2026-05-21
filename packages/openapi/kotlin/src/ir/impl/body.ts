import type { IR } from "@hey-api/shared";
import type { HttpMethod, Schema } from "@ir-kit/openapi";
import { classifyBody, isSchemaObject } from "@ir-kit/openapi";
import type { KtType } from "../../kt-dsl/index.js";
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
} from "../../kt-dsl/index.js";
import { paramIdent } from "../identifiers.js";
import { setMethodWithBody } from "./request.js";
import { serializerFor } from "./serializer.js";

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
  body: IR.BodyObject,
  method: HttpMethod,
  bodyType: KtType,
): BodyResult {
  const { shape, schema } = classifyBody(body);
  switch (shape.kind) {
    case "json-opaque":
      return {
        stmts: [emitMethodWithRawBody(method, "application/json")],
        needsMultipart: false,
      };
    case "json-typed":
      return { stmts: emitJsonBody(method, bodyType), needsMultipart: false };
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

function emitJsonBody(method: HttpMethod, bodyType: KtType): KtStmt[] {
  return [
    ktVal(
      "payload",
      ktCall(ktMember(ktMember(ktIdent("client"), "json"), "encodeToString"), [
        ktArg(serializerFor(bodyType)),
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
  const required = new Set(schema.required ?? []);
  const stmts: KtStmt[] = [
    ktVal("multipart", ktCall(ktIdent("MultipartFormBody"), [])),
  ];
  for (const [propName, propSchema] of Object.entries(
    schema.properties ?? {},
  )) {
    if (!isSchemaObject(propSchema)) continue;
    const id = paramIdent(propName);
    const isBinary =
      propSchema.type === "string" && propSchema.format === "binary";
    const append: KtStmt = isBinary
      ? ktExprStmt(
          ktCall(ktMember(ktIdent("multipart"), "appendFile"), [
            ktArg(ktStr(propName)),
            ktArg(ktStr(propName)),
            ktArg(ktIdent(id)),
          ]),
        )
      : ktExprStmt(
          ktCall(ktMember(ktIdent("multipart"), "appendText"), [
            ktArg(ktStr(propName)),
            ktArg(ktInterp([ktIdent(id)])),
          ]),
        );
    stmts.push(
      required.has(propName)
        ? append
        : ktIf(ktNe(ktIdent(id), ktNull), [append]),
    );
  }
  stmts.push(
    setMethodWithBody(
      method,
      ktCall(ktMember(ktIdent("multipart"), "build"), []),
    ),
  );
  return stmts;
}

function emitFormUrlEncodedBody(schema: Schema, method: HttpMethod): KtStmt[] {
  const required = new Set(schema.required ?? []);
  const stmts: KtStmt[] = [
    ktVal("formBuilder", ktCall(ktIdent("FormBody.Builder"), [])),
  ];
  for (const propName of Object.keys(schema.properties ?? {})) {
    const id = paramIdent(propName);
    const append: KtStmt = ktExprStmt(
      ktCall(ktMember(ktIdent("formBuilder"), "add"), [
        ktArg(ktStr(propName)),
        ktArg(ktInterp([ktIdent(id)])),
      ]),
    );
    stmts.push(
      required.has(propName)
        ? append
        : ktIf(ktNe(ktIdent(id), ktNull), [append]),
    );
  }
  stmts.push(
    setMethodWithBody(
      method,
      ktCall(ktMember(ktIdent("formBuilder"), "build"), []),
    ),
  );
  return stmts;
}
