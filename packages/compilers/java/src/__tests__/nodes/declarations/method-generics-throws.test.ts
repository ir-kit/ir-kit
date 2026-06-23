import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('method generics and throws', () => {
  it('generic method with throws clause', async () => {
    const T = java.factory.createTypeParameter('T', [java.factory.createIdentifier('Number')]);

    const method = java.factory.createMethodDeclaration(
      'id',
      [java.factory.createMethodParameter('value', java.factory.createIdentifier('T'))],
      java.factory.createIdentifier('T'),
      [java.factory.createReturnStatement(java.factory.createIdentifier('value'))],
      ['public', 'static'],
      [],
      [T],
      [java.factory.createIdentifier('IOException'), java.factory.createIdentifier('SQLException')],
    );

    const cls = java.factory.createClassDeclaration('Util', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'method-generics-throws.java');
  });

  it('generic method with multiple type parameters and bounds', async () => {
    const T = java.factory.createTypeParameter('T', [java.factory.createIdentifier('Comparable')]);
    const U = java.factory.createTypeParameter('U', [java.factory.createIdentifier('Number')]);

    const method = java.factory.createMethodDeclaration(
      'compareAndConvert',
      [
        java.factory.createMethodParameter('first', java.factory.createIdentifier('T')),
        java.factory.createMethodParameter('second', java.factory.createIdentifier('T')),
        java.factory.createMethodParameter('converter', java.factory.createIdentifier('U')),
      ],
      java.factory.createIdentifier('U'),
      [
        java.factory.createReturnStatement(
          java.factory.createTernaryExpression(
            java.factory.createBinaryExpression(
              java.factory.createCallExpression(
                java.factory.createMemberExpression(
                  java.factory.createIdentifier('first'),
                  java.factory.createIdentifier('compareTo'),
                ),
                [java.factory.createIdentifier('second')],
              ),
              '>',
              java.factory.createLiteral(0),
            ),
            java.factory.createIdentifier('converter'),
            java.factory.createLiteral(0),
          ),
        ),
      ],
      ['public', 'static'],
      [],
      [T, U],
      [
        java.factory.createIdentifier('IllegalArgumentException'),
        java.factory.createIdentifier('ArithmeticException'),
      ],
    );

    const cls = java.factory.createClassDeclaration('GenericUtil', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'multi-generic-method-throws.java');
  });

  it('generic method with recursive type bounds', async () => {
    const T = java.factory.createTypeParameter('T', [
      java.factory.createMemberExpression(
        java.factory.createIdentifier('Comparable'),
        java.factory.createIdentifier('T'),
      ),
    ]);

    const method = java.factory.createMethodDeclaration(
      'max',
      [
        java.factory.createMethodParameter('a', java.factory.createIdentifier('T')),
        java.factory.createMethodParameter('b', java.factory.createIdentifier('T')),
      ],
      java.factory.createIdentifier('T'),
      [
        java.factory.createReturnStatement(
          java.factory.createTernaryExpression(
            java.factory.createBinaryExpression(
              java.factory.createCallExpression(
                java.factory.createMemberExpression(
                  java.factory.createIdentifier('a'),
                  java.factory.createIdentifier('compareTo'),
                ),
                [java.factory.createIdentifier('b')],
              ),
              '>',
              java.factory.createLiteral(0),
            ),
            java.factory.createIdentifier('a'),
            java.factory.createIdentifier('b'),
          ),
        ),
      ],
      ['public', 'static'],
      [],
      [T],
      [java.factory.createIdentifier('NullPointerException')],
    );

    const cls = java.factory.createClassDeclaration('RecursiveGenericUtil', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'recursive-generic-method-throws.java');
  });

  it('generic method with wildcard parameters and throws', async () => {
    const method = java.factory.createMethodDeclaration(
      'processNumbers',
      [
        java.factory.createMethodParameter(
          'numbers',
          java.factory.createMemberExpression(
            java.factory.createIdentifier('List'),
            java.factory.createWildcardTypeArgument(
              'extends',
              java.factory.createIdentifier('Number'),
            ),
          ),
        ),
      ],
      java.factory.createIdentifier('double'),
      [java.factory.createReturnStatement(java.factory.createLiteral(0.0))],
      ['public', 'static'],
      [],
      undefined,
      [
        java.factory.createIdentifier('UnsupportedOperationException'),
        java.factory.createIdentifier('ClassCastException'),
      ],
    );

    const cls = java.factory.createClassDeclaration('WildcardProcessor', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'wildcard-generic-method-throws.java');
  });

  it('generic method with annotations and throws', async () => {
    const T = java.factory.createTypeParameter('T');

    const SuppressWarningsAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier('SuppressWarnings'),
      [java.factory.createLiteral('unchecked')],
    );

    const SafeVarargsAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier('SafeVarargs'),
    );

    const method = java.factory.createMethodDeclaration(
      'safeVarargsMethod',
      [
        java.factory.createMethodParameter(
          'args',
          java.factory.createArrayType(java.factory.createIdentifier('T'), 1),
          undefined,
          undefined,
          true, // varargs
        ),
      ],
      java.factory.createIdentifier('void'),
      [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(
            java.factory.createMemberExpression(
              java.factory.createMemberExpression(
                java.factory.createIdentifier('System'),
                java.factory.createIdentifier('out'),
              ),
              java.factory.createIdentifier('println'),
            ),
            [java.factory.createLiteral('Processing varargs')],
          ),
        ),
      ],
      ['public', 'static'],
      [SuppressWarningsAnnotation, SafeVarargsAnnotation],
      [T],
      [java.factory.createIdentifier('Exception')],
    );

    const cls = java.factory.createClassDeclaration('AnnotatedGenericUtil', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'annotated-generic-method-throws.java');
  });
});
