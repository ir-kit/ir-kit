import { describe, expect, it } from "vitest";
import { resolveAliases } from "../src/ir/aliases.js";
import { newTypeNames } from "../src/ir/identifiers.js";
import { operationsToDecls } from "../src/ir/operations.js";
import { schemasToDecls } from "../src/ir/schema.js";
import { buildJavaProject } from "../src/project/build.js";
import { ir, securityNamesMap } from "./_helpers.js";

function build(fragment: Parameters<typeof ir>[0]) {
  const model = ir(fragment);
  const names = newTypeNames();
  const schemas = schemasToDecls(model.components?.schemas ?? {}, names);
  const ops = operationsToDecls(model.paths, {
    names,
    securitySchemeNames: securityNamesMap(fragment),
  });
  const files = buildJavaProject(resolveAliases([...schemas, ...ops.decls]), {
    packageName: "com.acme",
  });
  return Object.fromEntries(files.map((f) => [f.path, f.content]));
}

describe("schemas", () => {
  it("emits a record with Jackson renames and boxed optionals", () => {
    const files = build({
      components: {
        schemas: {
          Pet: {
            type: "object",
            required: ["id"],
            properties: {
              id: { type: "integer", format: "int64" },
              pet_name: { type: "string" },
              born: { type: "string", format: "date-time" },
            },
          },
        },
      },
    });
    expect(files["com/acme/model/Pet.java"]).toBe(
      [
        "package com.acme.model;",
        "",
        "import com.fasterxml.jackson.annotation.JsonProperty;",
        "import java.time.OffsetDateTime;",
        "",
        'public record Pet(Long id, @JsonProperty("pet_name") String petName, OffsetDateTime born) {}',
        "",
      ].join("\n"),
    );
  });

  it("emits string enums carrying their wire value", () => {
    const files = build({
      components: {
        schemas: {
          Sort: { type: "string", enum: ["ASC", "asc", "first-name"] },
        },
      },
    });
    const sort = files["com/acme/model/Sort.java"];
    expect(sort).toContain(
      '  ASC("ASC"),\n  ASC_2("asc"),\n  FIRST_NAME("first-name");',
    );
    expect(sort).toContain("@JsonValue");
  });

  it("emits integer enums as Java enums over int", () => {
    const files = build({
      components: { schemas: { Level: { type: "integer", enum: [1, 2, -1] } } },
    });
    const level = files["com/acme/model/Level.java"];
    expect(level).toContain(
      "  VALUE_1(1),\n  VALUE_2(2),\n  VALUE_MINUS_1(-1);",
    );
    expect(level).toContain("  private final int value;");
  });

  it("uses long literals when integer enum values exceed int", () => {
    const files = build({
      components: {
        schemas: { Big: { type: "integer", enum: [1, 3000000000] } },
      },
    });
    const big = files["com/acme/model/Big.java"];
    expect(big).toContain("  VALUE_1(1L),\n  VALUE_3000000000(3000000000L);");
    expect(big).toContain("  private final long value;");
  });

  it("escapes string enum wire values", () => {
    const files = build({
      components: {
        schemas: { Quote: { type: "string", enum: ['say "hi"', "a\\b"] } },
      },
    });
    const quote = files["com/acme/model/Quote.java"];
    expect(quote).toContain('("say \\"hi\\"")');
    expect(quote).toContain('("a\\\\b")');
  });

  it("inlines aliases because Java has no typealias", () => {
    const files = build({
      components: {
        schemas: {
          Tags: { type: "array", items: { type: "string" } },
          Post: {
            type: "object",
            properties: { tags: { $ref: "#/components/schemas/Tags" } },
          },
        },
      },
    });
    expect(files["com/acme/model/Tags.java"]).toBeUndefined();
    expect(files["com/acme/model/Post.java"]).toContain(
      "public record Post(List<String> tags) {}",
    );
  });
});

describe("multi-status responses", () => {
  it("returns a sealed interface permitting one record per status", () => {
    const files = build({
      paths: {
        "/jobs": {
          post: {
            operationId: "createJob",
            tags: ["jobs"],
            responses: {
              "200": {
                description: "done",
                content: { "application/json": { schema: { type: "string" } } },
              },
              "202": { description: "accepted" },
            },
          },
        },
      },
    });
    expect(files["com/acme/model/CreateJobResponse.java"]).toContain(
      "public sealed interface CreateJobResponse\n    permits CreateJobResponseStatus200, CreateJobResponseStatus202 {}",
    );
    expect(files["com/acme/model/CreateJobResponseStatus200.java"]).toContain(
      "public record CreateJobResponseStatus200(String value) implements CreateJobResponse {}",
    );
  });
});

describe("operations", () => {
  const fragment = {
    components: {
      securitySchemes: { key: { type: "apiKey", in: "header", name: "X-Key" } },
    },
    paths: {
      "/pets/{petId}": {
        get: {
          operationId: "getPet",
          tags: ["pets"],
          security: [{ key: [] }],
          parameters: [
            {
              name: "petId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
            {
              name: "fields",
              in: "query",
              schema: { type: "array", items: { type: "string" } },
            },
            { name: "X-Trace", in: "header", schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "ok",
              content: { "application/json": { schema: { type: "string" } } },
            },
          },
        },
        delete: {
          operationId: "deletePet",
          tags: ["pets"],
          parameters: [
            {
              name: "petId",
              in: "path",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: { "204": { description: "gone" } },
        },
      },
    },
  };

  it("declares abstract methods plus option-less default overloads", () => {
    const api = build(fragment)["com/acme/api/PetsApi.java"];
    expect(api).toContain(
      "  String getPet(Integer petId, List<String> fields, String XTrace, RequestOptions options);",
    );
    expect(api).toContain(
      "  default void deletePet(Integer petId) {\n    this.deletePet(petId, RequestOptions.defaults());\n  }",
    );
    expect(api).toContain(
      "  ApiResult<Void> deletePetWithResponse(Integer petId, RequestOptions options);",
    );
  });

  it("builds the request from path, query, header and auth", () => {
    const impl = build(fragment)["com/acme/api/HttpPetsApi.java"];
    expect(impl).toContain("public class HttpPetsApi implements PetsApi {");
    expect(impl).toContain(
      'UrlEncoding.addArray(query, "fields", fields, QueryStyle.FORM, true);',
    );
    expect(impl).toContain(
      'UrlEncoding.path(baseUri, "pets", String.valueOf(petId))',
    );
    expect(impl).toContain(
      'if (XTrace != null) {\n      builder.header("X-Trace", String.valueOf(XTrace));',
    );
    expect(impl).toContain('for (var scheme : List.of("key")) {');
    expect(impl).toContain(
      "return client.execute(builder, new TypeReference<String>() {}, options);",
    );
    expect(impl).toContain("client.executeVoid(builder, options);");
  });
});
