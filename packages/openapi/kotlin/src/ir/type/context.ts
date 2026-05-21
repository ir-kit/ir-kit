import type { TypeCtx as IRTypeCtx } from "@ir-kit/openapi";

import type { KtDecl } from "../../kt-dsl/decl/types.js";

export type TypeCtx = IRTypeCtx<KtDecl>;
