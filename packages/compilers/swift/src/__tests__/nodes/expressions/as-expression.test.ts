import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('as expression', () => {
  it('conditionally casts a value', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'example',
          value: swift.factory.createAsExpression(
            swift.factory.createIdentifier('value'),
            swift.factory.createIdentifierType('String'),
            'as?',
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'as-expression.swift');
  });
});
