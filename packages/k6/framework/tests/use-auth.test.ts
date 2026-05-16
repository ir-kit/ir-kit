import { describe, expect, it, vi } from "vitest";

import { useAuth } from "../src/use-auth.ts";

describe("useAuth.session", () => {
  it("calls signIn lazily and caches its result across requests", () => {
    const signIn = vi.fn(() => "session=abc");
    const mw = useAuth.session({ signIn });

    expect(signIn).not.toHaveBeenCalled();
    expect(mw.headers!()).toEqual({ Cookie: "session=abc" });
    expect(mw.headers!()).toEqual({ Cookie: "session=abc" });
    expect(signIn).toHaveBeenCalledTimes(1);
  });

  it("uses a custom headerName when provided", () => {
    const mw = useAuth.session({
      signIn: () => "tok",
      headerName: "X-Session",
    });
    expect(mw.headers!()).toEqual({ "X-Session": "tok" });
  });
});
