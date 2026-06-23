import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('if statement', () => {
  it('simple', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createIfStatement(go.factory.createLiteral(true), [
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier('fmt'),
                go.factory.createIdentifier('Println'),
              ),
              [go.factory.createLiteral('hello')],
            ),
          ),
          go.factory.createReturnStatement(),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple.go');
  });

  it('with else', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('x', go.factory.createLiteral(1)),
        go.factory.createIfStatement(
          go.factory.createBinaryExpression(
            go.factory.createIdentifier('x'),
            '>',
            go.factory.createLiteral(0),
          ),
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createLiteral('positive')],
              ),
            ),
            go.factory.createReturnStatement(),
          ],
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createLiteral('not positive')],
              ),
            ),
            go.factory.createReturnStatement(),
          ],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-else.go');
  });

  it('with else if', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('x', go.factory.createLiteral(0)),
        go.factory.createIfStatement(
          go.factory.createBinaryExpression(
            go.factory.createIdentifier('x'),
            '>',
            go.factory.createLiteral(0),
          ),
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createLiteral('positive')],
              ),
            ),
            go.factory.createReturnStatement(),
          ],
          go.factory.createIfStatement(
            go.factory.createBinaryExpression(
              go.factory.createIdentifier('x'),
              '<',
              go.factory.createLiteral(0),
            ),
            [
              go.factory.createExpressionStatement(
                go.factory.createCallExpression(
                  go.factory.createMemberExpression(
                    go.factory.createIdentifier('fmt'),
                    go.factory.createIdentifier('Println'),
                  ),
                  [go.factory.createLiteral('negative')],
                ),
              ),
              go.factory.createReturnStatement(),
            ],
            [
              go.factory.createExpressionStatement(
                go.factory.createCallExpression(
                  go.factory.createMemberExpression(
                    go.factory.createIdentifier('fmt'),
                    go.factory.createIdentifier('Println'),
                  ),
                  [go.factory.createLiteral('zero')],
                ),
              ),
              go.factory.createReturnStatement(),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-else-if.go');
  });

  it('with initialization', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createIfStatement(
          go.factory.createBinaryExpression(
            go.factory.createIdentifier('x'),
            '>',
            go.factory.createLiteral(0),
          ),
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createLiteral('positive')],
              ),
            ),
            go.factory.createReturnStatement(),
          ],
          undefined,
          go.factory.createShortVarDeclaration('x', go.factory.createLiteral(5)),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-initialization.go');
  });
});
