import "@typespec/json-schema";

using JsonSchema;

@jsonSchema
namespace Petstore;

@jsonSchema
model Pet {
  id: int64;
  name: string;
  tag?: string;
}

@jsonSchema
model Pets {
  pets: Pet[];
}
