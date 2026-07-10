import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('do statement', () => {
  it('with a catch clause', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration('run', [], undefined, [
        swift.factory.createDoStatement(
          [
            swift.factory.createExpressionStatement(
              swift.factory.createTryExpression(
                swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier('risky'),
                  [],
                ),
                'try',
              ),
            ),
          ],
          [
            swift.factory.createCatchClause([
              swift.factory.createExpressionStatement(
                swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier('print'),
                  [{ expression: swift.factory.createStringLiteral('failed') }],
                ),
              ),
            ]),
          ],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'do.swift');
  });
});
