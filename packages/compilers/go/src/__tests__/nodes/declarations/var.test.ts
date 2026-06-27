import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('variable declaration', () => {
  it('with type and value', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVarDeclaration([
        {
          name: 'count',
          type: go.factory.createIdentifier('int'),
          value: go.factory.createLiteral(42),
        },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
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
    await assertPrintedMatchesSnapshot(file, 'with-type-and-value.go');
  });

  it('with type only', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVarDeclaration([
        { name: 'message', type: go.factory.createIdentifier('string') },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
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
    await assertPrintedMatchesSnapshot(file, 'with-type-only.go');
  });

  it('with value only', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVarDeclaration([{ name: 'flag', value: go.factory.createLiteral(true) }]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('flag')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-value-only.go');
  });

  it('string variable', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVarDeclaration([
        {
          name: 'greeting',
          type: go.factory.createIdentifier('string'),
          value: go.factory.createLiteral('Hello, World!'),
        },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('greeting')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'string-variable.go');
  });

  it('grouped var block', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVarDeclaration([
        { name: 'host', value: go.factory.createLiteral('localhost') },
        { name: 'port', value: go.factory.createLiteral(8080) },
        { name: 'enabled', type: go.factory.createIdentifier('bool') },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [
              go.factory.createIdentifier('host'),
              go.factory.createIdentifier('port'),
              go.factory.createIdentifier('enabled'),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'grouped-var.go');
  });
});
