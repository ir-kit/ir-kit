import "@typespec/protobuf";

using Protobuf;

@Protobuf.package({ name: "petstore" })
namespace Petstore;

model Pet {
  @field(1) id: int64;
  @field(2) name: string;
}

model Pets {
  @field(1) pets: Pet[];
}

model Empty {}

@Protobuf.service
interface PetStore {
  list(...Empty): Pets;
}
