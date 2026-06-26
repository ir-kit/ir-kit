import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('index expression', () => {
  it('basic index a[i]', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'a',
          go.factory.createCompositeLiteral(
            [
              go.factory.createLiteral(10),
              go.factory.createLiteral(20),
              go.factory.createLiteral(30),
            ],
            go.factory.createArrayType(go.factory.createIdentifier('int')),
          ),
        ),
        go.factory.createShortVarDeclaration('i', go.factory.createLiteral(1)),
        go.factory.createShortVarDeclaration(
          'v',
          go.factory.createIndexExpression(
            go.factory.createIdentifier('a'),
            go.factory.createIdentifier('i'),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('v')],
          ),
        ),
      ]),
    ]);

    await assertPrintedMatchesSnapshot(file, 'basic-index.go');
  });

  it('nested index matrix[i][j]', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        // matrix := [][]int{{1,2},{3,4}}
        go.factory.createShortVarDeclaration(
          'matrix',
          go.factory.createCompositeLiteral(
            [
              go.factory.createCompositeLiteral(
                [go.factory.createLiteral(1), go.factory.createLiteral(2)],
                go.factory.createArrayType(go.factory.createIdentifier('int')),
              ),
              go.factory.createCompositeLiteral(
                [go.factory.createLiteral(3), go.factory.createLiteral(4)],
                go.factory.createArrayType(go.factory.createIdentifier('int')),
              ),
            ],
            go.factory.createArrayType(
              go.factory.createArrayType(go.factory.createIdentifier('int')),
            ),
          ),
        ),
        go.factory.createShortVarDeclaration('i', go.factory.createLiteral(0)),
        go.factory.createShortVarDeclaration('j', go.factory.createLiteral(1)),
        go.factory.createShortVarDeclaration(
          'v',
          go.factory.createIndexExpression(
            go.factory.createIndexExpression(
              go.factory.createIdentifier('matrix'),
              go.factory.createIdentifier('i'),
            ),
            go.factory.createIdentifier('j'),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('v')],
          ),
        ),
      ]),
    ]);

    await assertPrintedMatchesSnapshot(file, 'nested-index.go');
  });

  it('index chained with member and call obj[i].Do()', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      // type T struct{}
      go.factory.createTypeDeclaration('T', go.factory.createStructType([])),
      // func (t T) Do() int { return 42 }
      go.factory.createFunctionDeclaration(
        'Do',
        [],
        [go.factory.createFunctionReturn(go.factory.createIdentifier('int'))],
        [go.factory.createReturnStatement(go.factory.createLiteral(42))],
        {
          name: 't',
          type: go.factory.createIdentifier('T'),
        },
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        // obj := []T{{}, {}}
        go.factory.createShortVarDeclaration(
          'obj',
          go.factory.createCompositeLiteral(
            [
              go.factory.createCompositeLiteral([], go.factory.createIdentifier('T')),
              go.factory.createCompositeLiteral([], go.factory.createIdentifier('T')),
            ],
            go.factory.createArrayType(go.factory.createIdentifier('T')),
          ),
        ),
        go.factory.createShortVarDeclaration('i', go.factory.createLiteral(0)),
        go.factory.createShortVarDeclaration(
          'v',
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIndexExpression(
                go.factory.createIdentifier('obj'),
                go.factory.createIdentifier('i'),
              ),
              go.factory.createIdentifier('Do'),
            ),
            [],
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('v')],
          ),
        ),
      ]),
    ]);

    await assertPrintedMatchesSnapshot(file, 'advanced-index.go');
  });
});
