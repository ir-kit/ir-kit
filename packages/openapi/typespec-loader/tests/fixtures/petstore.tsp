import "@typespec/http";
import "@typespec/rest";

using Http;
using Rest;

@service(#{ title: "Petstore" })
namespace Petstore;

model Pet {
  id: int64;
  name: string;
  tag?: string;
}

@route("/pets")
interface Pets {
  @get list(): Pet[];
  @get get(@path id: int64): Pet;
  @post create(@body pet: Pet): Pet;
}
