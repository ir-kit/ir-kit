import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('class declarations', () => {
  it('simple class with method', async () => {
    const cls = java.factory.createClassDeclaration(
      'Greeter',
      [
        java.factory.createMethodDeclaration(
          'greet',
          [java.factory.createMethodParameter('name', java.factory.createIdentifier('String'))],
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
                [java.factory.createLiteral('Hello, '), java.factory.createIdentifier('name')],
              ),
            ),
          ],
          ['public'],
        ),
      ],
      ['public'],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'class.java');
  });

  it('abstract class with abstract and concrete methods', async () => {
    const abstractMethod = java.factory.createMethodDeclaration(
      'calculate',
      [java.factory.createMethodParameter('value', java.factory.createIdentifier('double'))],
      java.factory.createIdentifier('double'),
      [], // empty body for abstract method
      ['public', 'abstract'],
    );

    const concreteMethod = java.factory.createMethodDeclaration(
      'display',
      [java.factory.createMethodParameter('result', java.factory.createIdentifier('double'))],
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
            [java.factory.createIdentifier('result')],
          ),
        ),
      ],
      ['public'],
    );

    const cls = java.factory.createClassDeclaration(
      'Calculator',
      [abstractMethod, concreteMethod],
      ['public', 'abstract'],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'abstract-class.java');
  });

  it('final class with static members', async () => {
    const staticField = java.factory.createVariableDeclaration(
      'VERSION',
      java.factory.createIdentifier('String'),
      java.factory.createLiteral('1.0.0'),
      ['public', 'static', 'final'],
    );

    const staticMethod = java.factory.createMethodDeclaration(
      'getVersion',
      [],
      java.factory.createIdentifier('String'),
      [java.factory.createReturnStatement(java.factory.createIdentifier('VERSION'))],
      ['public', 'static'],
    );

    const instanceMethod = java.factory.createMethodDeclaration(
      'process',
      [java.factory.createMethodParameter('data', java.factory.createIdentifier('String'))],
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
            [java.factory.createIdentifier('data')],
          ),
        ),
      ],
      ['public'],
    );

    const cls = java.factory.createClassDeclaration(
      'Utility',
      [staticField, staticMethod, instanceMethod],
      ['public', 'final'],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'final-class.java');
  });

  it('class with inheritance and interface implementation', async () => {
    const field = java.factory.createVariableDeclaration(
      'name',
      java.factory.createIdentifier('String'),
      undefined,
      ['private'],
    );

    const constructor = java.factory.createMethodDeclaration(
      'Student',
      [java.factory.createMethodParameter('name', java.factory.createIdentifier('String'))],
      undefined,
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('name'),
          ),
          java.factory.createIdentifier('name'),
        ),
      ],
      ['public'],
    );

    const getNameMethod = java.factory.createMethodDeclaration(
      'getName',
      [],
      java.factory.createIdentifier('String'),
      [
        java.factory.createReturnStatement(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('name'),
          ),
        ),
      ],
      ['public'],
    );

    const cls = java.factory.createClassDeclaration(
      'Student',
      [field, constructor, getNameMethod],
      ['public'],
      undefined,
      java.factory.createIdentifier('Person'), // extends Person
      [java.factory.createIdentifier('Serializable')], // implements Serializable
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'inheritance-class.java');
  });

  it('generic class with type parameters and bounds', async () => {
    const T = java.factory.createTypeParameter('T', [java.factory.createIdentifier('Comparable')]);
    const U = java.factory.createTypeParameter('U', [java.factory.createIdentifier('Number')]);

    const field = java.factory.createVariableDeclaration(
      'value',
      java.factory.createIdentifier('T'),
      undefined,
      ['private'],
    );

    const constructor = java.factory.createMethodDeclaration(
      'Container',
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
      ['public'],
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
      'Container',
      [field, constructor, getValueMethod],
      ['public'],
      undefined,
      undefined,
      undefined,
      [T, U],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'generic-class.java');
  });

  it('class with annotations and comments', async () => {
    const EntityAnnotation = java.factory.createAnnotation(java.factory.createIdentifier('Entity'));

    const TableAnnotation = java.factory.createAnnotation(java.factory.createIdentifier('Table'), [
      { name: 'name', value: java.factory.createLiteral('users') },
    ]);

    const field = java.factory.createVariableDeclaration(
      'id',
      java.factory.createIdentifier('Long'),
      undefined,
      ['private'],
    );

    const getIdMethod = java.factory.createMethodDeclaration(
      'getId',
      [],
      java.factory.createIdentifier('Long'),
      [
        java.factory.createReturnStatement(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('id'),
          ),
        ),
      ],
      ['public'],
    );

    const cls = java.factory.createClassDeclaration(
      'User',
      [field, getIdMethod],
      ['public'],
      [EntityAnnotation, TableAnnotation],
      undefined,
      undefined,
      undefined,
      ['// User entity class', '// Represents a user in the system'],
      ['// End of User class'],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'annotated-class.java');
  });

  it('nested static class', async () => {
    const outerField = java.factory.createVariableDeclaration(
      'outerValue',
      java.factory.createIdentifier('String'),
      undefined,
      ['private'],
    );

    const nestedClass = java.factory.createClassDeclaration(
      'NestedClass',
      [
        java.factory.createVariableDeclaration(
          'nestedValue',
          java.factory.createIdentifier('int'),
          undefined,
          ['private'],
        ),
        java.factory.createMethodDeclaration(
          'getNestedValue',
          [],
          java.factory.createIdentifier('int'),
          [
            java.factory.createReturnStatement(
              java.factory.createMemberExpression(
                java.factory.createThisExpression(),
                java.factory.createIdentifier('nestedValue'),
              ),
            ),
          ],
          ['public'],
        ),
      ],
      ['public', 'static'],
    );

    const outerMethod = java.factory.createMethodDeclaration(
      'getOuterValue',
      [],
      java.factory.createIdentifier('String'),
      [
        java.factory.createReturnStatement(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('outerValue'),
          ),
        ),
      ],
      ['public'],
    );

    const outerClass = java.factory.createClassDeclaration(
      'OuterClass',
      [outerField, nestedClass, outerMethod],
      ['public'],
    );

    const file = java.factory.createSourceFile(undefined, [outerClass]);
    await assertPrintedMatchesSnapshot(file, 'nested-class.java');
  });
});
