import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('const declaration', () => {
  it('with type and value', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [
            go.factory.createVariableDeclaration(
              'PI',
              go.factory.createIdentifier('float64'),
              go.factory.createLiteral(3.14159),
            ),
          ],
          go.NodeFlags.Const,
        ),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('PI')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-type-and-value.go');
  });

  it('with value only', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [
            go.factory.createVariableDeclaration(
              'MaxRetries',
              undefined,
              go.factory.createLiteral(5),
            ),
          ],
          go.NodeFlags.Const,
        ),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('MaxRetries')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-value-only.go');
  });

  it('string constant', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [
            go.factory.createVariableDeclaration(
              'AppName',
              go.factory.createIdentifier('string'),
              go.factory.createLiteral('MyApp'),
            ),
          ],
          go.NodeFlags.Const,
        ),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('AppName')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'string-constant.go');
  });

  it('boolean constant', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [
            go.factory.createVariableDeclaration(
              'Debug',
              go.factory.createIdentifier('bool'),
              go.factory.createLiteral(true),
            ),
          ],
          go.NodeFlags.Const,
        ),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createIfStatement(
          go.factory.createIdentifier('Debug'),
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createLiteral('Debug mode')],
              ),
            ),
          ],
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createLiteral('Normal mode')],
              ),
            ),
          ],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'boolean-constant.go');
  });

  it('grouped iota enum', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec('Status', go.factory.createIdentifier('int')),
      ]),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [
            go.factory.createVariableDeclaration(
              'StatusActive',
              go.factory.createIdentifier('Status'),
              go.factory.createIdentifier('iota'),
            ),
            go.factory.createVariableDeclaration('StatusInactive'),
            go.factory.createVariableDeclaration('StatusPending'),
          ],
          go.NodeFlags.Const,
        ),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('StatusActive')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'grouped-iota-enum.go');
  });

  it('grouped typed string enum', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec('Color', go.factory.createIdentifier('string')),
      ]),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [
            go.factory.createVariableDeclaration(
              'ColorRed',
              go.factory.createIdentifier('Color'),
              go.factory.createLiteral('red'),
            ),
            go.factory.createVariableDeclaration(
              'ColorGreen',
              go.factory.createIdentifier('Color'),
              go.factory.createLiteral('green'),
            ),
            go.factory.createVariableDeclaration(
              'ColorBlue',
              go.factory.createIdentifier('Color'),
              go.factory.createLiteral('blue'),
            ),
          ],
          go.NodeFlags.Const,
        ),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('ColorRed')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'grouped-typed-string-enum.go');
  });

  it('grouped untyped values align', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createVariableStatement(
        undefined,
        go.factory.createVariableDeclarationList(
          [
            go.factory.createVariableDeclaration('X', undefined, go.factory.createLiteral(1)),
            go.factory.createVariableDeclaration('YY', undefined, go.factory.createLiteral(22)),
            go.factory.createVariableDeclaration('ZZZ', undefined, go.factory.createLiteral(333)),
          ],
          go.NodeFlags.Const,
        ),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('X')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'grouped-untyped-values.go');
  });
});
