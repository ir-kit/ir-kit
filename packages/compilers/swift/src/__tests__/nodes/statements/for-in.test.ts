import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('for-in statement', () => {
  it('iterating over a sequence', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'run',
        [
          {
            firstName: 'items',
            type: swift.factory.createArrayType(swift.factory.createIdentifierType('Int')),
          },
        ],
        undefined,
        [
          swift.factory.createForInStatement('item', swift.factory.createIdentifier('items'), [
            swift.factory.createExpressionStatement(
              swift.factory.createFunctionCallExpression(swift.factory.createIdentifier('print'), [
                { expression: swift.factory.createIdentifier('item') },
              ]),
            ),
          ]),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'for-in.swift');
  });
});
