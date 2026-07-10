import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('subscript expression', () => {
  it('indexes into an identifier', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'example',
          value: swift.factory.createSubscriptExpression(swift.factory.createIdentifier('items'), [
            swift.factory.createIntegerLiteral('0'),
          ]),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'subscript-expression.swift');
  });
});
