import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('assignment statement', () => {
  it('simple assignment', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration('x', go.factory.createLiteral(0)),
        go.factory.createAssignment(
          [go.factory.createIdentifier('x')],
          [go.factory.createLiteral(10)],
        ),
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
    await assertPrintedMatchesSnapshot(file, 'simple.go');
  });

  it('assignment with expression', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration('a', go.factory.createLiteral(6)),
        go.factory.createShortVarDeclaration('b', go.factory.createLiteral(7)),
        go.factory.createShortVarDeclaration('result', go.factory.createLiteral(0)),
        go.factory.createAssignment(
          [go.factory.createIdentifier('result')],
          [
            go.factory.createBinaryExpression(
              go.factory.createIdentifier('a'),
              '*',
              go.factory.createIdentifier('b'),
            ),
          ],
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('result')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-expression.go');
  });

  it('assignment with function call', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(
        undefined,
        'getValue',
        undefined,
        undefined,
        [go.factory.createFunctionReturn(go.factory.createIdentifier('int'))],
        [go.factory.createReturnStatement(go.factory.createLiteral(42))],
      ),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration('value', go.factory.createLiteral(0)),
        go.factory.createAssignment(
          [go.factory.createIdentifier('value')],
          [go.factory.createCallExpression(go.factory.createIdentifier('getValue'))],
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
    await assertPrintedMatchesSnapshot(file, 'with-function-call.go');
  });

  it('multi-value assignment', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(undefined, 'main', undefined, undefined, undefined, [
        go.factory.createShortVarDeclaration('a', go.factory.createLiteral(1)),
        go.factory.createShortVarDeclaration('b', go.factory.createLiteral(2)),
        go.factory.createAssignment(
          [go.factory.createIdentifier('a'), go.factory.createIdentifier('b')],
          [go.factory.createIdentifier('b'), go.factory.createIdentifier('a')],
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('a'), go.factory.createIdentifier('b')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'multi-value.go');
  });
});
