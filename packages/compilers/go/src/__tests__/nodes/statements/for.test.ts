import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('for statement', () => {
  it('infinite loop', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createForStatement([
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier('fmt'),
                go.factory.createIdentifier('Println'),
              ),
              [go.factory.createLiteral('tick')],
            ),
          ),
          go.factory.createReturnStatement(),
        ]),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'infinite.go');
  });

  it('while-style with condition', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('x', go.factory.createLiteral(1)),
        go.factory.createForStatement(
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createLiteral('loop')],
              ),
            ),
            go.factory.createAugmentAssignment(
              go.factory.createIdentifier('x'),
              '-=',
              go.factory.createLiteral(1),
            ),
            go.factory.createIfStatement(go.factory.createLiteral(true), [
              go.factory.createReturnStatement(),
            ]),
          ],
          undefined,
          go.factory.createBinaryExpression(
            go.factory.createIdentifier('x'),
            '>',
            go.factory.createLiteral(0),
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'while.go');
  });

  it('classic 3-clause (init; condition; post)', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createForStatement(
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createLiteral('loop')],
              ),
            ),
            go.factory.createIfStatement(go.factory.createLiteral(true), [
              go.factory.createReturnStatement(),
            ]),
          ],
          go.factory.createShortVarDeclaration('i', go.factory.createLiteral(0)),
          go.factory.createBinaryExpression(
            go.factory.createIdentifier('i'),
            '<',
            go.factory.createLiteral(10),
          ),
          go.factory.createIncDecStatement(go.factory.createIdentifier('i'), '++'),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'three-clause.go');
  });

  it('nested loops', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createForStatement(
          [
            go.factory.createForStatement(
              [
                go.factory.createExpressionStatement(
                  go.factory.createCallExpression(
                    go.factory.createMemberExpression(
                      go.factory.createIdentifier('fmt'),
                      go.factory.createIdentifier('Println'),
                    ),
                    [go.factory.createLiteral('inner')],
                  ),
                ),
                go.factory.createReturnStatement(),
              ],
              go.factory.createShortVarDeclaration('j', go.factory.createLiteral(0)),
              go.factory.createBinaryExpression(
                go.factory.createIdentifier('j'),
                '<',
                go.factory.createLiteral(3),
              ),
              go.factory.createIncDecStatement(go.factory.createIdentifier('j'), '++'),
            ),
          ],
          go.factory.createShortVarDeclaration('i', go.factory.createLiteral(0)),
          go.factory.createBinaryExpression(
            go.factory.createIdentifier('i'),
            '<',
            go.factory.createLiteral(2),
          ),
          go.factory.createIncDecStatement(go.factory.createIdentifier('i'), '++'),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'nested.go');
  });
});
