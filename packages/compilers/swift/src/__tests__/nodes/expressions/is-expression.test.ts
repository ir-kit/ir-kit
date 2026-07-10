import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('is expression', () => {
  it('checks a type', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'example',
          value: swift.factory.createIsExpression(
            swift.factory.createIdentifier('value'),
            swift.factory.createIdentifierType('String'),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'is-expression.swift');
  });
});
