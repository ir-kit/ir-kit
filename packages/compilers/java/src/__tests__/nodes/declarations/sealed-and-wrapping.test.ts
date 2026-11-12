import { java } from "../../../index.js";
import { assertPrintedMatchesSnapshot } from "../utils.js";

const f = java.factory;
const id = (name: string) => f.createIdentifier(name);

describe("sealed interfaces and line wrapping", () => {
  it("sealed interface with permits", async () => {
    const decl = f.createInterfaceDeclaration(
      "Shape",
      [],
      ["public", "sealed"],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      [id("Circle"), id("Square")],
    );
    await assertPrintedMatchesSnapshot(
      f.createSourceFile(undefined, [decl]),
      "sealed-interface.java",
    );
  });

  it("wraps long headers, enum constants, comments and calls", async () => {
    const longType =
      "CustomerBalanceResourceCashBalanceTransactionResourceFundedTransaction";
    const rec = f.createRecordDeclaration(
      `${longType}ResourceBankTransferResource`,
      [
        f.createMethodParameter("reference", id("String")),
        f.createMethodParameter(
          "items",
          f.createParameterizedType(id("List"), [
            id(`${longType}RequestedAddressTypes`),
          ]),
        ),
      ],
      [],
      ["public"],
    );
    const en = f.createEnumDeclaration(
      "Category",
      [
        {
          name: "CABLE_SATELLITE_AND_OTHER_PAY_TELEVISION_AND_RADIO_SERVICES",
          args: [
            f.createLiteral(
              "cable_satellite_and_other_pay_television_and_radio_services",
            ),
          ],
        },
      ],
      [],
      ["public"],
    );
    const method = f.createMethodDeclaration(
      "createRealtimeTranscriptionSessionWithResponse",
      [
        f.createMethodParameter(
          "body",
          id("RealtimeTranscriptionSessionCreateRequest"),
        ),
        f.createMethodParameter("options", id("RequestOptions")),
      ],
      f.createParameterizedType(id("ApiResult"), [
        id("RealtimeTranscriptionSessionCreateResponse"),
      ]),
      [
        f.createReturnStatement(
          f.createCallExpression(
            f.createMemberExpression(
              f.createThisExpression(),
              id(
                "deleteMetadataTemplatesEnterpriseSecurityClassificationSchemaWithResponse",
              ),
            ),
            [id("body"), id("options")],
          ),
        ),
      ],
      ["public"],
      undefined,
      undefined,
      undefined,
      undefined,
      [
        "GET /organization/workload_identity_providers/{workload_identity_provider_id}/federation_rules",
      ],
    );
    const cls = f.createClassDeclaration(
      "HttpShieldInformationBarrierSegmentRestrictionsApi",
      [method],
      ["public"],
      undefined,
      undefined,
      [id("ShieldInformationBarrierSegmentRestrictionsApi")],
    );
    await assertPrintedMatchesSnapshot(
      f.createSourceFile(undefined, [rec, en, cls]),
      "wrapping.java",
    );
  });
});
