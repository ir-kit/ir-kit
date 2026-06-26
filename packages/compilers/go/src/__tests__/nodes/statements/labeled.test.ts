import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('labeled statements', () => {
  it('labeled loop with break and continue to the label', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createLabeledStatement(
          'Outer',
          go.factory.createForRangeStatement(
            go.factory.createLiteral(3),
            [
              go.factory.createForRangeStatement(
                go.factory.createLiteral(3),
                [
                  go.factory.createIfStatement(
                    go.factory.createBinaryExpression(
                      go.factory.createIdentifier('j'),
                      '==',
                      go.factory.createLiteral(1),
                    ),
                    [go.factory.createContinueStatement('Outer')],
                  ),
                  go.factory.createIfStatement(
                    go.factory.createBinaryExpression(
                      go.factory.createIdentifier('i'),
                      '==',
                      go.factory.createLiteral(2),
                    ),
                    [go.factory.createBreakStatement('Outer')],
                  ),
                  go.factory.createExpressionStatement(
                    go.factory.createCallExpression(
                      go.factory.createMemberExpression(
                        go.factory.createIdentifier('fmt'),
                        go.factory.createIdentifier('Println'),
                      ),
                      [go.factory.createIdentifier('i'), go.factory.createIdentifier('j')],
                    ),
                  ),
                ],
                ['j'],
              ),
            ],
            ['i'],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'labeled-loop.go');
  });

  it('goto to a label', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('i', go.factory.createLiteral(0)),
        go.factory.createLabeledStatement(
          'Retry',
          go.factory.createIfStatement(
            go.factory.createBinaryExpression(
              go.factory.createIdentifier('i'),
              '<',
              go.factory.createLiteral(3),
            ),
            [
              go.factory.createExpressionStatement(
                go.factory.createCallExpression(
                  go.factory.createMemberExpression(
                    go.factory.createIdentifier('fmt'),
                    go.factory.createIdentifier('Println'),
                  ),
                  [go.factory.createIdentifier('i')],
                ),
              ),
              go.factory.createIncDecStatement(go.factory.createIdentifier('i'), '++'),
              go.factory.createGotoStatement('Retry'),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'goto.go');
  });
});
