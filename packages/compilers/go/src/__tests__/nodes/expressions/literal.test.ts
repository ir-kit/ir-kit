import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('literal', () => {
  it('string', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('message', go.factory.createLiteral('Hello, World!')),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('message')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'string.go');
  });

  it('number', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('count', go.factory.createLiteral(42)),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('count')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'number.go');
  });

  it('boolean true', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('isActive', go.factory.createLiteral(true)),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('isActive')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'boolean-true.go');
  });

  it('boolean false', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('isActive', go.factory.createLiteral(false)),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('isActive')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'boolean-false.go');
  });

  it('null', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVarDeclaration(
          'value',
          go.factory.createInterfaceType(undefined),
          go.factory.createLiteral(null),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('value')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'null.go');
  });
});
