import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('self expression', () => {
  it('member access on self inside a method', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration('Container', [
        swift.factory.createVariableDeclaration('let', [
          {
            initializer: swift.factory.createIntegerLiteral('0'),
            pattern: 'value',
            typeAnnotation: swift.factory.createIdentifierType('Int'),
          },
        ]),
        swift.factory.createFunctionDeclaration('read', [], undefined, [
          swift.factory.createVariableDeclaration('let', [
            {
              initializer: swift.factory.createMemberAccessExpression(
                swift.factory.createSelfExpression(),
                'value',
              ),
              pattern: 'x',
            },
          ]),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'self-member-access.swift');
  });
});
