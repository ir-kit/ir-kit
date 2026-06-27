import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('variable declaration', () => {
  it('with type and value', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [
            go.factory.createVariableDeclaration(
              'count',
              go.factory.createIdentifier('int'),
              go.factory.createLiteral(42),
            ),
          ],
          go.NodeFlags.Var,
        ),
      ),
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
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [go.factory.createVariableDeclaration('message', go.factory.createIdentifier('string'))],
          go.NodeFlags.Var,
        ),
      ),
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
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [go.factory.createVariableDeclaration('flag', undefined, go.factory.createLiteral(true))],
          go.NodeFlags.Var,
        ),
      ),
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
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [
            go.factory.createVariableDeclaration(
              'greeting',
              go.factory.createIdentifier('string'),
              go.factory.createLiteral('Hello, World!'),
            ),
          ],
          go.NodeFlags.Var,
        ),
      ),
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
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [
            go.factory.createVariableDeclaration(
              'host',
              undefined,
              go.factory.createLiteral('localhost'),
            ),
            go.factory.createVariableDeclaration('port', undefined, go.factory.createLiteral(8080)),
            go.factory.createVariableDeclaration('enabled', go.factory.createIdentifier('bool')),
          ],
          go.NodeFlags.Var,
        ),
      ),
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
