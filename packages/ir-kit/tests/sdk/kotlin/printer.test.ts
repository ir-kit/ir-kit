import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  ktAnnotation,
  ktDataClass,
  ktEnum,
  ktEnumEntry,
  ktFile,
  ktFun,
  ktFunParam,
  ktInt,
  ktInterface,
  ktList,
  ktNullable,
  ktProp,
  ktRef,
  ktStr,
  ktString,
  printFile,
} from "../../../src/sdk/kotlin/index.ts";

describe("printer", () => {
  it("emits a public @Serializable data class with required + optional props", () => {
    const file = ktFile({
      pkg: "com.example.api",
      imports: ["kotlinx.serialization.Serializable"],
      decls: [
        ktDataClass({
          name: "User",
          annotations: [ktAnnotation("Serializable")],
          properties: [
            ktProp({ name: "id", type: ktString }),
            ktProp({
              name: "name",
              type: ktNullable(ktString),
              default: "null",
            }),
          ],
        }),
      ],
    });

    assert.equal(
      printFile(file),
      `package com.example.api

import kotlinx.serialization.Serializable

@Serializable
public data class User(
    public val id: String,
    public val name: String? = null,
)
`,
    );
  });

  it("emits a String-raw @Serializable enum class", () => {
    const file = ktFile({
      pkg: "com.example.api",
      decls: [
        ktEnum({
          name: "Status",
          annotations: [ktAnnotation("Serializable")],
          properties: [ktProp({ name: "raw", type: ktString })],
          entries: [
            ktEnumEntry("ACTIVE", ktStr("active"), [
              ktAnnotation("SerialName", ktStr("active")),
            ]),
            ktEnumEntry("PENDING", ktStr("pending"), [
              ktAnnotation("SerialName", ktStr("pending")),
            ]),
          ],
        }),
      ],
    });
    const out = printFile(file);
    assert.match(out, /enum class Status\(\n\s+public val raw: String,\n\)/);
    assert.match(out, /@SerialName\("active"\)\n\s+ACTIVE\("active"\)/);
  });

  it("emits an interface with suspend funs and no body", () => {
    const file = ktFile({
      pkg: "com.example.api",
      decls: [
        ktInterface({
          name: "UsersApi",
          funs: [
            ktFun({
              name: "getUser",
              params: [ktFunParam({ name: "id", type: ktString })],
              returnType: ktRef("User"),
              modifiers: ["suspend"],
              doc: "GET /users/{id}",
            }),
          ],
        }),
      ],
    });
    assert.equal(
      printFile(file),
      `package com.example.api

public interface UsersApi {
    /** GET /users/{id} */
    suspend fun getUser(id: String): User
}
`,
    );
  });

  it("composes List, nullable, ref types", () => {
    const file = ktFile({
      pkg: "com.example.api",
      decls: [
        ktDataClass({
          name: "Page",
          annotations: [ktAnnotation("Serializable")],
          properties: [
            ktProp({
              name: "items",
              type: ktList(ktRef("User")),
            }),
            ktProp({ name: "total", type: ktInt }),
            ktProp({
              name: "next",
              type: ktNullable(ktString),
              default: "null",
            }),
          ],
        }),
      ],
    });
    const out = printFile(file);
    assert.match(out, /public val items: List<User>/);
    assert.match(out, /public val next: String\? = null/);
  });

  it("ktNullable is idempotent (does not double-wrap)", () => {
    const t = ktNullable(ktString);
    assert.equal(ktNullable(t), t);
  });
});
