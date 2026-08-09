import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('if statement', () => {
  it('with an else branch inside a function', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'run',
        [{ firstName: 'flag', type: swift.factory.createIdentifierType('Bool') }],
        undefined,
        [
          swift.factory.createIfStatement(
            [swift.factory.createIdentifier('flag')],
            [
              swift.factory.createExpressionStatement(
                swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier('print'),
                  [{ expression: swift.factory.createStringLiteral('yes') }],
                ),
              ),
            ],
            [
              swift.factory.createExpressionStatement(
                swift.factory.createFunctionCallExpression(
                  swift.factory.createIdentifier('print'),
                  [{ expression: swift.factory.createStringLiteral('no') }],
                ),
              ),
            ],
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'if.swift');
  });
});
