import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('selector expression', () => {
  it('selector for a method reference', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createClassDeclaration('MyClass', [
        swift.factory.createFunctionDeclaration(
          'method',
          [],
          undefined,
          [],
          undefined,
          undefined,
          undefined,
          [{ name: 'objc' }],
        ),
      ]),
      swift.factory.createVariableDeclaration('let', [
        {
          name: 'sel',
          value: swift.factory.createSelectorExpression(
            swift.factory.createMemberAccessExpression(
              swift.factory.createIdentifier('MyClass'),
              'method',
            ),
          ),
        },
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'selector-method-reference.swift');
  });
});
