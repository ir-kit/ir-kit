import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('type assertion', () => {
  it('asserts a concrete type', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVarDeclaration([
          {
            name: 'i',
            type: go.factory.createIdentifier('any'),
            value: go.factory.createLiteral('hello'),
          },
        ]),
        go.factory.createShortVarDeclaration(
          's',
          go.factory.createTypeAssertExpression(
            go.factory.createIdentifier('i'),
            go.factory.createIdentifier('string'),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('s')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'type-assert.go');
  });
});
