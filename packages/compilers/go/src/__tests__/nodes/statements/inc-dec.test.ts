import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('inc/dec statement', () => {
  it('standalone ++', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration('x', go.factory.createLiteral(0)),
        go.factory.createIncDecStatement(go.factory.createIdentifier('x'), '++'),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('x')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'inc.go');
  });

  it('standalone --', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration('y', go.factory.createLiteral(2)),
        go.factory.createIncDecStatement(go.factory.createIdentifier('y'), '--'),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('y')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'dec.go');
  });

  it('in for post clause', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createForStatement(
          go.factory.createShortVarDeclaration('i', go.factory.createLiteral(0)),
          go.factory.createBinaryExpression(
            go.factory.createIdentifier('i'),
            '<',
            go.factory.createLiteral(3),
          ),
          go.factory.createIncDecStatement(go.factory.createIdentifier('i'), '++'),
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
            go.factory.createIfStatement(go.factory.createLiteral(true), [
              go.factory.createReturnStatement(),
            ]),
          ],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'for-inc.go');
  });
});
