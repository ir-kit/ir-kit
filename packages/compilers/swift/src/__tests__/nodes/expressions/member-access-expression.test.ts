import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('member access expression', () => {
  it('accesses a property on an identifier', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'example',
          value: swift.factory.createMemberAccessExpression(
            swift.factory.createIdentifier('foo'),
            'bar',
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'member-access-expression.swift');
  });
});
