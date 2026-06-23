import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('enum declarations', () => {
  it('basic enum with color constants and hex field', async () => {
    const e = java.factory.createEnumDeclaration(
      'Color',
      [{ name: 'RED' }, { name: 'GREEN' }, { name: 'BLUE' }],
      [java.factory.createVariableDeclaration('hex', java.factory.createIdentifier('String'))],
      ['public'],
    );

    const file = java.factory.createSourceFile(undefined, [e]);
    await assertPrintedMatchesSnapshot(file, 'enum.java');
  });

  it('priority enum with constructor and getter method', async () => {
    const field = java.factory.createVariableDeclaration(
      'level',
      java.factory.createIdentifier('int'),
      undefined,
      ['private', 'final'],
    );

    const constructor = java.factory.createMethodDeclaration(
      'Priority',
      [java.factory.createMethodParameter('level', java.factory.createIdentifier('int'))],
      undefined,
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('level'),
          ),
          java.factory.createIdentifier('level'),
        ),
      ],
      ['private'],
    );

    const getLevelMethod = java.factory.createMethodDeclaration(
      'getLevel',
      [],
      java.factory.createIdentifier('int'),
      [
        java.factory.createReturnStatement(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('level'),
          ),
        ),
      ],
      ['public'],
    );

    const e = java.factory.createEnumDeclaration(
      'Priority',
      [
        { args: [java.factory.createLiteral(1)], name: 'LOW' },
        { args: [java.factory.createLiteral(2)], name: 'MEDIUM' },
        { args: [java.factory.createLiteral(3)], name: 'HIGH' },
      ],
      [field, constructor, getLevelMethod],
      ['public'],
    );

    const file = java.factory.createSourceFile(undefined, [e]);
    await assertPrintedMatchesSnapshot(file, 'enum-with-constructor.java');
  });

  it('status enum implementing Describable interface', async () => {
    const field = java.factory.createVariableDeclaration(
      'description',
      java.factory.createIdentifier('String'),
      undefined,
      ['private', 'final'],
    );

    const constructor = java.factory.createMethodDeclaration(
      'Status',
      [java.factory.createMethodParameter('description', java.factory.createIdentifier('String'))],
      undefined,
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('description'),
          ),
          java.factory.createIdentifier('description'),
        ),
      ],
      ['private'],
    );

    const getDescriptionMethod = java.factory.createMethodDeclaration(
      'getDescription',
      [],
      java.factory.createIdentifier('String'),
      [
        java.factory.createReturnStatement(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('description'),
          ),
        ),
      ],
      ['public'],
    );

    const e = java.factory.createEnumDeclaration(
      'Status',
      [
        {
          args: [java.factory.createLiteral('Task is pending')],
          name: 'PENDING',
        },
        {
          args: [java.factory.createLiteral('Task is in progress')],
          name: 'IN_PROGRESS',
        },
        {
          args: [java.factory.createLiteral('Task is completed')],
          name: 'COMPLETED',
        },
      ],
      [field, constructor, getDescriptionMethod],
      ['public'],
      undefined,
      [java.factory.createIdentifier('Describable')],
    );

    const file = java.factory.createSourceFile(undefined, [e]);
    await assertPrintedMatchesSnapshot(file, 'enum-implements-interface.java');
  });

  it('enum with abstract method declaration', async () => {
    const abstractMethod = java.factory.createMethodDeclaration(
      'getSymbol',
      [],
      java.factory.createIdentifier('String'),
      [], // abstract method has no body
      ['public', 'abstract'],
    );

    const e = java.factory.createEnumDeclaration(
      'Operation',
      [{ name: 'PLUS' }, { name: 'MINUS' }, { name: 'MULTIPLY' }],
      [abstractMethod],
      ['public'],
    );

    const file = java.factory.createSourceFile(undefined, [e]);
    await assertPrintedMatchesSnapshot(file, 'enum-abstract-method.java');
  });

  it('state enum with static fields and methods', async () => {
    const staticField = java.factory.createVariableDeclaration(
      'DEFAULT_COUNT',
      java.factory.createIdentifier('int'),
      java.factory.createLiteral(0),
      ['public', 'static', 'final'],
    );

    const staticMethod = java.factory.createMethodDeclaration(
      'getDefaultCount',
      [],
      java.factory.createIdentifier('int'),
      [java.factory.createReturnStatement(java.factory.createIdentifier('DEFAULT_COUNT'))],
      ['public', 'static'],
    );

    const instanceMethod = java.factory.createMethodDeclaration(
      'isDefault',
      [],
      java.factory.createIdentifier('boolean'),
      [
        java.factory.createReturnStatement(
          java.factory.createBinaryExpression(
            java.factory.createCallExpression(
              java.factory.createMemberExpression(
                java.factory.createThisExpression(),
                java.factory.createIdentifier('ordinal'),
              ),
              [],
            ),
            '==',
            java.factory.createIdentifier('DEFAULT_COUNT'),
          ),
        ),
      ],
      ['public'],
    );

    const e = java.factory.createEnumDeclaration(
      'State',
      [{ name: 'INITIAL' }, { name: 'PROCESSING' }, { name: 'COMPLETED' }],
      [staticField, staticMethod, instanceMethod],
      ['public'],
    );

    const file = java.factory.createSourceFile(undefined, [e]);
    await assertPrintedMatchesSnapshot(file, 'enum-static-members.java');
  });

  it('deprecated legacy status enum with annotations', async () => {
    const DeprecatedAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier('Deprecated'),
    );

    const SuppressWarningsAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier('SuppressWarnings'),
      [java.factory.createLiteral('unused')],
    );

    const field = java.factory.createVariableDeclaration(
      'code',
      java.factory.createIdentifier('int'),
      undefined,
      ['private', 'final'],
    );

    const constructor = java.factory.createMethodDeclaration(
      'LegacyStatus',
      [java.factory.createMethodParameter('code', java.factory.createIdentifier('int'))],
      undefined,
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('code'),
          ),
          java.factory.createIdentifier('code'),
        ),
      ],
      ['private'],
    );

    const e = java.factory.createEnumDeclaration(
      'LegacyStatus',
      [
        { args: [java.factory.createLiteral(1)], name: 'OLD' },
        { args: [java.factory.createLiteral(2)], name: 'VERY_OLD' },
      ],
      [field, constructor],
      ['public'],
      [DeprecatedAnnotation, SuppressWarningsAnnotation],
      undefined,
      ['// Legacy enum', '// Will be removed in future version'],
      ['// End of legacy enum'],
    );

    const file = java.factory.createSourceFile(undefined, [e]);
    await assertPrintedMatchesSnapshot(file, 'enum-annotated.java');
  });

  it('HTTP status enum with multiple constructor parameters', async () => {
    const nameField = java.factory.createVariableDeclaration(
      'name',
      java.factory.createIdentifier('String'),
      undefined,
      ['private', 'final'],
    );

    const valueField = java.factory.createVariableDeclaration(
      'value',
      java.factory.createIdentifier('int'),
      undefined,
      ['private', 'final'],
    );

    const constructor = java.factory.createMethodDeclaration(
      'HttpStatus',
      [
        java.factory.createMethodParameter('name', java.factory.createIdentifier('String')),
        java.factory.createMethodParameter('value', java.factory.createIdentifier('int')),
      ],
      undefined,
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('name'),
          ),
          java.factory.createIdentifier('name'),
        ),
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

    const getValueMethod = java.factory.createMethodDeclaration(
      'getValue',
      [],
      java.factory.createIdentifier('int'),
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
      'HttpStatus',
      [
        {
          args: [java.factory.createLiteral('OK'), java.factory.createLiteral(200)],
          name: 'OK',
        },
        {
          args: [java.factory.createLiteral('Not Found'), java.factory.createLiteral(404)],
          name: 'NOT_FOUND',
        },
        {
          args: [
            java.factory.createLiteral('Internal Server Error'),
            java.factory.createLiteral(500),
          ],
          name: 'INTERNAL_SERVER_ERROR',
        },
      ],
      [nameField, valueField, constructor, getNameMethod, getValueMethod],
      ['public'],
    );

    const file = java.factory.createSourceFile(undefined, [e]);
    await assertPrintedMatchesSnapshot(file, 'enum-complex-args.java');
  });
});
