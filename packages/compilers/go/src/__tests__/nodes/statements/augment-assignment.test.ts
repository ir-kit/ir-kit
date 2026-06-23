import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('augment assignment statement', () => {
  it('arithmetic operators', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('x', go.factory.createLiteral(0)),
        go.factory.createShortVarDeclaration('y', go.factory.createLiteral(0)),
        go.factory.createShortVarDeclaration('z', go.factory.createLiteral(0)),
        go.factory.createShortVarDeclaration('a', go.factory.createLiteral(0)),
        go.factory.createShortVarDeclaration('b', go.factory.createLiteral(0)),
        go.factory.createAugmentAssignment(
          go.factory.createIdentifier('x'),
          '+=',
          go.factory.createLiteral(1),
        ),
        go.factory.createAugmentAssignment(
          go.factory.createIdentifier('y'),
          '-=',
          go.factory.createLiteral(2),
        ),
        go.factory.createAugmentAssignment(
          go.factory.createIdentifier('z'),
          '*=',
          go.factory.createLiteral(3),
        ),
        go.factory.createAugmentAssignment(
          go.factory.createIdentifier('a'),
          '/=',
          go.factory.createLiteral(4),
        ),
        go.factory.createAugmentAssignment(
          go.factory.createIdentifier('b'),
          '%=',
          go.factory.createLiteral(5),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [
              go.factory.createIdentifier('x'),
              go.factory.createIdentifier('y'),
              go.factory.createIdentifier('z'),
              go.factory.createIdentifier('a'),
              go.factory.createIdentifier('b'),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'arithmetic.go');
  });

  it('bitwise and shift operators', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('x', go.factory.createLiteral(1)),
        go.factory.createShortVarDeclaration('y', go.factory.createLiteral(1)),
        go.factory.createShortVarDeclaration('z', go.factory.createLiteral(1)),
        go.factory.createShortVarDeclaration('a', go.factory.createLiteral(1)),
        go.factory.createShortVarDeclaration('b', go.factory.createLiteral(1)),
        go.factory.createAugmentAssignment(
          go.factory.createIdentifier('x'),
          '&=',
          go.factory.createLiteral(1),
        ),
        go.factory.createAugmentAssignment(
          go.factory.createIdentifier('y'),
          '|=',
          go.factory.createLiteral(1),
        ),
        go.factory.createAugmentAssignment(
          go.factory.createIdentifier('z'),
          '^=',
          go.factory.createLiteral(1),
        ),
        go.factory.createAugmentAssignment(
          go.factory.createIdentifier('a'),
          '>>=',
          go.factory.createLiteral(1),
        ),
        go.factory.createAugmentAssignment(
          go.factory.createIdentifier('b'),
          '<<=',
          go.factory.createLiteral(1),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [
              go.factory.createIdentifier('x'),
              go.factory.createIdentifier('y'),
              go.factory.createIdentifier('z'),
              go.factory.createIdentifier('a'),
              go.factory.createIdentifier('b'),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'bitwise.go');
  });
});
