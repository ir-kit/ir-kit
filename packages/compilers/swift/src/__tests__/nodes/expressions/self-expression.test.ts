import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('self expression', () => {
  it('member access on self inside a method', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration('Container', [
        swift.factory.createVariableDeclaration('let', [
          {
            name: 'value',
            type: swift.factory.createIdentifierType('Int'),
            value: swift.factory.createIntegerLiteral('0'),
          },
        ]),
        swift.factory.createFunctionDeclaration('read', [], undefined, [
          swift.factory.createVariableDeclaration('let', [
            {
              name: 'x',
              value: swift.factory.createMemberAccessExpression(
                swift.factory.createSelfExpression(),
                'value',
              ),
            },
          ]),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'self-member-access.swift');
  });
});
