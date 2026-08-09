import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('continue statement', () => {
  it('inside a for-in loop', async () => {
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
            swift.factory.createContinueStatement(),
          ]),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'continue.swift');
  });
});
