import type { IR } from "@hey-api/shared";
import { java } from "@ir-kit/compiler-java";
import {
  classifyBody,
  HTTP_METHOD_LITERAL,
  iterateObjectProperties,
  paramsAt,
  parseTemplatedSegment,
  splitPathSegments,
} from "@ir-kit/openapi";
import {
  isVoid,
  type JDecl,
  type JExpr,
  type JMethod,
  type JStmt,
  type JType,
  jAnnotation,
  jAssign,
  jBinary,
  jClass,
  jDiamond,
  jExprStmt,
  jField,
  jForEach,
  jIdent,
  jIf,
  jLit,
  jLocal,
  jMember,
  jMethod,
  jMethodCall,
  jNew,
  jNewAnon,
  jParam,
  jRef,
  jReturn,
  jString,
  jTernary,
  jThrow,
} from "../../ast/index.js";
import { operationParamIdent } from "../identifiers.js";
import {
  type OperationSignature,
  optionsParam,
} from "../operation/signature.js";

const ident = jIdent;
const NULL = jLit(null);
const str = (s: string) => jLit(s);
const valueOf = (e: JExpr) => jMethodCall(ident("String"), "valueOf", [e]);
const typeRef = (t: JType) => jNewAnon(jRef("TypeReference", [t]));

export interface ClientClassResult {
  class: JDecl;
  needsMultipart: boolean;
}

export function buildClientClass(
  className: string,
  interfaceName: string,
  signatures: ReadonlyArray<OperationSignature>,
): ClientClassResult {
  let needsMultipart = false;
  const methods: JMethod[] = [];
  for (const sig of signatures) {
    const request = requestStmts(sig);
    if (request.multipart) needsMultipart = true;
    methods.push(
      implMethod(sig, sig.name, sig.returnType, [
        ...request.stmts,
        ...decodeStmts(sig, false),
      ]),
      implMethod(
        sig,
        `${sig.name}WithResponse`,
        withResponseType(sig.returnType),
        [...request.stmts, ...decodeStmts(sig, true)],
      ),
    );
  }
  const ctor = java.factory.createMethodDeclaration(
    className,
    [jParam("client", jRef("ApiClient"))],
    undefined,
    [
      jAssign(
        jMember(java.factory.createThisExpression(), "client"),
        ident("client"),
      ),
    ],
    ["public"],
  );
  return {
    class: jClass({
      name: className,
      implements: [interfaceName],
      members: [jField("client", jRef("ApiClient")), ctor, ...methods],
    }),
    needsMultipart,
  };
}

export function withResponseType(t: JType): JType {
  return jRef("ApiResult", [t]);
}

function implMethod(
  sig: OperationSignature,
  name: string,
  returnType: JType,
  body: ReadonlyArray<JStmt>,
): JMethod {
  return jMethod({
    name,
    params: [...sig.params, optionsParam()],
    returnType,
    modifiers: ["public"],
    annotations: [jAnnotation("Override")],
    body,
  });
}

function orElse(primary: JExpr, fallback: JExpr): JExpr {
  return jTernary(jBinary(primary, "!=", NULL), primary, fallback);
}

function requestStmts(sig: OperationSignature): {
  stmts: JStmt[];
  multipart: boolean;
} {
  const options = ident("options");
  const stmts: JStmt[] = [
    jLocal(
      "client",
      orElse(
        jMethodCall(options, "client"),
        jMember(java.factory.createThisExpression(), "client"),
      ),
    ),
    jLocal(
      "baseUri",
      orElse(
        jMethodCall(options, "baseUri"),
        jMember(ident("client"), "baseUri"),
      ),
    ),
    ...urlStmts(sig),
    jLocal("builder", jMethodCall(ident("HttpRequest"), "newBuilder")),
    ...headerStmts(sig),
  ];
  const body = sig.op.body ? bodyStmts(sig, sig.op.body) : undefined;
  if (body) stmts.push(...body.stmts);
  else stmts.push(setMethod(sig, jMethodCall(publishers(), "noBody")));
  if (sig.securitySchemeNames.length > 0) {
    stmts.push(
      jForEach(
        "scheme",
        jMethodCall(ident("List"), "of", sig.securitySchemeNames.map(str)),
        [
          jLocal(
            "auth",
            jMethodCall(jMember(ident("client"), "auth"), "get", [
              ident("scheme"),
            ]),
          ),
          jIf(jBinary(ident("auth"), "!=", NULL), [
            jAssign(
              ident("url"),
              jMethodCall(ident("auth"), "apply", [
                ident("builder"),
                ident("url"),
              ]),
            ),
          ]),
        ],
      ),
    );
  }
  stmts.push(
    jExprStmt(jMethodCall(ident("builder"), "uri", [ident("url")])),
    jForEach(
      "header",
      jMethodCall(jMethodCall(options, "headers"), "entrySet"),
      [
        jExprStmt(
          jMethodCall(ident("builder"), "header", [
            jMethodCall(ident("header"), "getKey"),
            jMethodCall(ident("header"), "getValue"),
          ]),
        ),
      ],
    ),
  );
  return { stmts, multipart: body?.multipart ?? false };
}

function urlStmts(sig: OperationSignature): JStmt[] {
  const pathParams = paramsAt(sig.locatedParams, "path");
  const queryParams = paramsAt(sig.locatedParams, "query");
  const segments = splitPathSegments(sig.pathStr).map((seg) =>
    segmentExpr(seg, pathParams),
  );
  const path = jMethodCall(ident("UrlEncoding"), "path", [
    ident("baseUri"),
    ...segments,
  ]);
  if (queryParams.length === 0) return [jLocal("url", path)];
  return [
    jLocal("query", jNew(jRef("ArrayList", [jString]))),
    ...queryParams.map(queryStmt),
    jLocal(
      "url",
      jMethodCall(ident("UrlEncoding"), "withQuery", [path, ident("query")]),
    ),
  ];
}

function segmentExpr(
  seg: string,
  pathParams: ReadonlyArray<IR.ParameterObject>,
): JExpr {
  const parts = parseTemplatedSegment(seg, pathParams).map((p) =>
    p.kind === "literal"
      ? str(p.text)
      : valueOf(ident(operationParamIdent(p.param ? p.param.name : p.name))),
  );
  if (parts.length === 0) return str("");
  return parts
    .slice(1)
    .reduce((acc, p) => jBinary(acc, "+", p), parts[0] as JExpr);
}

function queryStmt(p: IR.ParameterObject): JStmt {
  const args: JExpr[] = [
    ident("query"),
    str(p.name),
    ident(operationParamIdent(p.name)),
  ];
  const isArray = p.schema.type === "array";
  if (isArray) {
    args.push(
      jMember(ident("QueryStyle"), queryStyle(p.style)),
      jLit(p.explode ?? true),
    );
  }
  return jExprStmt(
    jMethodCall(ident("UrlEncoding"), isArray ? "addArray" : "addScalar", args),
  );
}

function queryStyle(style: IR.ParameterObject["style"]): string {
  if (style === "spaceDelimited") return "SPACE_DELIMITED";
  if (style === "pipeDelimited") return "PIPE_DELIMITED";
  return "FORM";
}

function headerStmts(sig: OperationSignature): JStmt[] {
  return paramsAt(sig.locatedParams, "header").map((p) => {
    const id = ident(operationParamIdent(p.name));
    const set = jExprStmt(
      jMethodCall(ident("builder"), "header", [str(p.name), valueOf(id)]),
    );
    return p.required ? set : jIf(jBinary(id, "!=", NULL), [set]);
  });
}

const publishers = () => jMember(ident("HttpRequest"), "BodyPublishers");

function setMethod(sig: OperationSignature, publisher: JExpr): JStmt {
  return jExprStmt(
    jMethodCall(ident("builder"), "method", [
      str(HTTP_METHOD_LITERAL[sig.method]),
      publisher,
    ]),
  );
}

function contentType(value: JExpr): JStmt {
  return jExprStmt(
    jMethodCall(ident("builder"), "header", [str("Content-Type"), value]),
  );
}

function bodyStmts(
  sig: OperationSignature,
  body: IR.BodyObject,
): { stmts: JStmt[]; multipart: boolean } {
  const { shape, schema } = classifyBody(body);
  const ofBytes = (e: JExpr) => jMethodCall(publishers(), "ofByteArray", [e]);
  switch (shape.kind) {
    case "json-typed":
      return {
        stmts: [
          contentType(str("application/json")),
          setMethod(
            sig,
            ofBytes(jMethodCall(ident("client"), "encode", [ident("body")])),
          ),
        ],
        multipart: false,
      };
    case "json-opaque":
    case "opaque":
      return {
        stmts: [
          contentType(str(body.mediaType || "application/octet-stream")),
          setMethod(sig, ofBytes(ident("body"))),
        ],
        multipart: false,
      };
    case "form-urlencoded-object": {
      const props = Array.from(iterateObjectProperties(schema));
      return {
        stmts: [
          jLocal("form", jNew(jRef("ArrayList", [jString]))),
          ...props.map(({ jsonKey }) =>
            jExprStmt(
              jMethodCall(ident("UrlEncoding"), "addScalar", [
                ident("form"),
                str(jsonKey),
                ident(operationParamIdent(jsonKey)),
              ]),
            ),
          ),
          contentType(str("application/x-www-form-urlencoded")),
          setMethod(
            sig,
            jMethodCall(publishers(), "ofString", [
              jMethodCall(ident("String"), "join", [str("&"), ident("form")]),
            ]),
          ),
        ],
        multipart: false,
      };
    }
    case "multipart-object": {
      const props = Array.from(iterateObjectProperties(schema));
      const parts = props.map(({ jsonKey, isBinary }) => {
        const id = ident(operationParamIdent(jsonKey));
        const append = isBinary
          ? jMethodCall(ident("form"), "appendFile", [
              str(jsonKey),
              str(jsonKey),
              id,
              str("application/octet-stream"),
            ])
          : jMethodCall(ident("form"), "appendText", [
              str(jsonKey),
              valueOf(id),
            ]);
        return jIf(jBinary(id, "!=", NULL), [jExprStmt(append)]);
      });
      return {
        stmts: [
          jLocal("form", jNew(jRef("MultipartFormBody"))),
          ...parts,
          contentType(jMethodCall(ident("form"), "contentType")),
          setMethod(sig, jMethodCall(ident("form"), "build")),
        ],
        multipart: true,
      };
    }
  }
}

function decodeStmts(sig: OperationSignature, withResponse: boolean): JStmt[] {
  const client = ident("client");
  const args = [ident("builder"), ident("options")];
  if (sig.responseCases.length > 0) return multiDecodeStmts(sig, withResponse);
  if (isVoid(sig.returnType)) {
    const call = jMethodCall(
      client,
      withResponse ? "executeVoidWithResponse" : "executeVoid",
      args,
    );
    return [withResponse ? jReturn(call) : jExprStmt(call)];
  }
  return [
    jReturn(
      jMethodCall(client, withResponse ? "executeWithResponse" : "execute", [
        ident("builder"),
        typeRef(sig.returnType),
        ident("options"),
      ]),
    ),
  ];
}

function multiDecodeStmts(
  sig: OperationSignature,
  withResponse: boolean,
): JStmt[] {
  const raw = ident("raw");
  const status = jMethodCall(jMethodCall(raw, "response"), "statusCode");
  const wrap = (value: JExpr) =>
    withResponse
      ? jNew(jDiamond("ApiResult"), [value, jMethodCall(raw, "response")])
      : value;
  return [
    jLocal(
      "raw",
      jMethodCall(ident("client"), "executeRaw", [
        ident("builder"),
        ident("options"),
      ]),
    ),
    ...sig.responseCases.map((c) =>
      jIf(jBinary(status, "==", jLit(Number(c.statusCode))), [
        jReturn(
          wrap(
            jNew(
              jRef(c.caseName),
              c.payloadType
                ? [
                    jMethodCall(ident("client"), "decode", [
                      jMethodCall(raw, "body"),
                      typeRef(c.payloadType),
                    ]),
                  ]
                : [],
            ),
          ),
        ),
      ]),
    ),
    jThrow(
      jMethodCall(ident("ApiException"), "forStatus", [
        status,
        jMethodCall(raw, "body"),
      ]),
    ),
  ];
}
