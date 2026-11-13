import { registerTypespecEmitter } from "./typespec-emitter.js";

registerTypespecEmitter("proto", "@typespec/protobuf", {
  authoredInputOnly: true,
});
