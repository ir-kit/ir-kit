import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('optional binding condition', () => {
  it('a guard-let unwrapping an optional', async () => {
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'run',
        [
          {
            firstName: 'optional',
            type: swift.factory.createOptionalType(swift.factory.createIdentifierType('Int')),
          },
        ],
        undefined,
        [
          swift.factory.createGuardStatement(
            [
              {
                bindingSpecifier: 'let',
                name: 'value',
                value: swift.factory.createIdentifier('optional'),
              },
            ],
            [swift.factory.createReturnStatement()],
          ),
          swift.factory.createExpressionStatement(
            swift.factory.createFunctionCallExpression(swift.factory.createIdentifier('print'), [
              { expression: swift.factory.createIdentifier('value') },
            ]),
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'guard-let-condition.swift');
  });
});
