import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('break and continue statements', () => {
  it('break statement', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(
        'print',
        undefined,
        [go.factory.createFunctionReturn(go.factory.createIdentifier('string'))],
        [
          go.factory.createForStatement(
            [
              go.factory.createExpressionStatement(
                go.factory.createCallExpression(
                  go.factory.createMemberExpression(
                    go.factory.createIdentifier('fmt'),
                    go.factory.createIdentifier('Printf'),
                  ),
                  [
                    go.factory.createLiteral('Iteration number: %v\n'),
                    go.factory.createIdentifier('i'),
                  ],
                ),
              ),
              go.factory.createBreakStatement(),
              go.factory.createReturnStatement(go.factory.createLiteral('this is not returned')),
            ],
            go.factory.createShortVarDeclaration('i', go.factory.createLiteral(0)),
            go.factory.createBinaryExpression(
              go.factory.createIdentifier('i'),
              '<',
              go.factory.createLiteral(5),
            ),
            go.factory.createIncDecStatement(go.factory.createIdentifier('i'), '++'),
          ),
          go.factory.createReturnStatement(go.factory.createLiteral('this is returned')),
        ],
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createCallExpression(go.factory.createIdentifier('print'), [])],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'break.go');
  });

  it('continue statement', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(
        'print',
        undefined,
        [go.factory.createFunctionReturn(go.factory.createIdentifier('string'))],
        [
          go.factory.createForStatement(
            [
              go.factory.createExpressionStatement(
                go.factory.createCallExpression(
                  go.factory.createMemberExpression(
                    go.factory.createIdentifier('fmt'),
                    go.factory.createIdentifier('Printf'),
                  ),
                  [
                    go.factory.createLiteral('Iteration number: %v\n'),
                    go.factory.createIdentifier('i'),
                  ],
                ),
              ),
              go.factory.createContinueStatement(),
              go.factory.createReturnStatement(go.factory.createLiteral('this is not returned')),
            ],
            go.factory.createShortVarDeclaration('i', go.factory.createLiteral(0)),
            go.factory.createBinaryExpression(
              go.factory.createIdentifier('i'),
              '<',
              go.factory.createLiteral(5),
            ),
            go.factory.createIncDecStatement(go.factory.createIdentifier('i'), '++'),
          ),
          go.factory.createReturnStatement(go.factory.createLiteral('this is returned')),
        ],
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createCallExpression(go.factory.createIdentifier('print'), [])],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'continue.go');
  });
});
