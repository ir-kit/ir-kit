import { swift } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('multi-condition if', () => {
  it('two optional bindings', async () => {
    const printCall = swift.factory.createExpressionStatement(
      swift.factory.createFunctionCallExpression(swift.factory.createIdentifier('print'), [
        { expression: swift.factory.createIdentifier('a') },
      ]),
    );
    const file = swift.factory.createSourceFile([
      swift.factory.createFunctionDeclaration(
        'run',
        [
          {
            firstName: 'x',
            type: swift.factory.createOptionalType(swift.factory.createIdentifierType('Int')),
          },
          {
            firstName: 'y',
            type: swift.factory.createOptionalType(swift.factory.createIdentifierType('Int')),
          },
        ],
        undefined,
        [
          swift.factory.createIfStatement(
            [
              { bindingSpecifier: 'let', name: 'a', value: swift.factory.createIdentifier('x') },
              { bindingSpecifier: 'let', name: 'b', value: swift.factory.createIdentifier('y') },
            ],
            [printCall],
          ),
        ],
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'two-optional-bindings.swift');
  });
});
