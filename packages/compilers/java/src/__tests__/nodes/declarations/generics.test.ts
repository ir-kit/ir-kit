import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('generics', () => {
  it('basic class with type parameters', async () => {
    const T = java.factory.createTypeParameter('T', [java.factory.createIdentifier('Comparable')]);
    const U = java.factory.createTypeParameter('U');

    const cls = java.factory.createClassDeclaration(
      'Holder',
      [],
      ['public'],
      undefined,
      undefined,
      undefined,
      [T, U],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'generics.java');
  });

  it('generic class with bounded type parameters', async () => {
    const T = java.factory.createTypeParameter('T', [java.factory.createIdentifier('Number')]);
    const U = java.factory.createTypeParameter('U', [
      java.factory.createIdentifier('Comparable'),
      java.factory.createIdentifier('Serializable'),
    ]);

    const field = java.factory.createVariableDeclaration(
      'value',
      java.factory.createIdentifier('T'),
      undefined,
      ['private'],
    );

    const getValueMethod = java.factory.createMethodDeclaration(
      'getValue',
      [],
      java.factory.createIdentifier('T'),
      [
        java.factory.createReturnStatement(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('value'),
          ),
        ),
      ],
      ['public'],
    );

    const cls = java.factory.createClassDeclaration(
      'BoundedContainer',
      [field, getValueMethod],
      ['public'],
      undefined,
      undefined,
      undefined,
      [T, U],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'bounded-generics.java');
  });

  it('generic interface with multiple bounds', async () => {
    const T = java.factory.createTypeParameter('T', [
      java.factory.createIdentifier('Comparable'),
      java.factory.createIdentifier('Serializable'),
    ]);

    const method = java.factory.createMethodDeclaration(
      'compare',
      [
        java.factory.createMethodParameter('a', java.factory.createIdentifier('T')),
        java.factory.createMethodParameter('b', java.factory.createIdentifier('T')),
      ],
      java.factory.createIdentifier('int'),
      [], // interface methods have no body
      ['public'],
    );

    const i = java.factory.createInterfaceDeclaration(
      'MultiBoundedComparator',
      [method],
      ['public'],
      undefined,
      undefined,
      false,
      [T],
    );

    const file = java.factory.createSourceFile(undefined, [i]);
    await assertPrintedMatchesSnapshot(file, 'multi-bounded-interface.java');
  });

  it('generic enum with type parameters', async () => {
    const field = java.factory.createVariableDeclaration(
      'value',
      java.factory.createIdentifier('T'),
      undefined,
      ['private', 'final'],
    );

    const constructor = java.factory.createMethodDeclaration(
      'GenericEnum',
      [java.factory.createMethodParameter('value', java.factory.createIdentifier('T'))],
      undefined,
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('value'),
          ),
          java.factory.createIdentifier('value'),
        ),
      ],
      ['private'],
    );

    const getValueMethod = java.factory.createMethodDeclaration(
      'getValue',
      [],
      java.factory.createIdentifier('T'),
      [
        java.factory.createReturnStatement(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('value'),
          ),
        ),
      ],
      ['public'],
    );

    const e = java.factory.createEnumDeclaration(
      'GenericEnum',
      [
        { args: [java.factory.createLiteral('first')], name: 'FIRST' },
        { args: [java.factory.createLiteral('second')], name: 'SECOND' },
      ],
      [field, constructor, getValueMethod],
      ['public'],
      undefined,
      undefined,
      undefined,
      ['T'],
    );

    const file = java.factory.createSourceFile(undefined, [e]);
    await assertPrintedMatchesSnapshot(file, 'generic-enum.java');
  });

  it('generic method with wildcard bounds', async () => {
    const method = java.factory.createMethodDeclaration(
      'processList',
      [
        java.factory.createMethodParameter(
          'list',
          java.factory.createMemberExpression(
            java.factory.createIdentifier('List'),
            java.factory.createWildcardTypeArgument(
              'extends',
              java.factory.createIdentifier('Number'),
            ),
          ),
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
            [java.factory.createLiteral('Processing list')],
          ),
        ),
      ],
      ['public', 'static'],
    );

    const cls = java.factory.createClassDeclaration('WildcardProcessor', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'wildcard-generics.java');
  });

  it('generic class with recursive type bounds', async () => {
    const T = java.factory.createTypeParameter('T', [
      java.factory.createMemberExpression(
        java.factory.createIdentifier('Comparable'),
        java.factory.createIdentifier('T'),
      ),
    ]);

    const field = java.factory.createVariableDeclaration(
      'value',
      java.factory.createIdentifier('T'),
      undefined,
      ['private'],
    );

    const compareToMethod = java.factory.createMethodDeclaration(
      'compareTo',
      [java.factory.createMethodParameter('other', java.factory.createIdentifier('T'))],
      java.factory.createIdentifier('int'),
      [
        java.factory.createReturnStatement(
          java.factory.createCallExpression(
            java.factory.createMemberExpression(
              java.factory.createMemberExpression(
                java.factory.createThisExpression(),
                java.factory.createIdentifier('value'),
              ),
              java.factory.createIdentifier('compareTo'),
            ),
            [java.factory.createIdentifier('other')],
          ),
        ),
      ],
      ['public'],
    );

    const cls = java.factory.createClassDeclaration(
      'RecursiveBounded',
      [field, compareToMethod],
      ['public'],
      undefined,
      undefined,
      undefined,
      [T],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'recursive-bounded-generics.java');
  });
});
