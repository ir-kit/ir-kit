import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('method declarations', () => {
  it('simple public method', async () => {
    const method = java.factory.createMethodDeclaration(
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
            [java.factory.createLiteral('Hello, ')],
          ),
        ),
      ],
      ['public'],
    );

    const cls = java.factory.createClassDeclaration('Greeter', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'simple-method.java');
  });

  it('static method with return value', async () => {
    const method = java.factory.createMethodDeclaration(
      'calculate',
      [
        java.factory.createMethodParameter('a', java.factory.createIdentifier('int')),
        java.factory.createMethodParameter('b', java.factory.createIdentifier('int')),
      ],
      java.factory.createIdentifier('int'),
      [
        java.factory.createReturnStatement(
          java.factory.createBinaryExpression(
            java.factory.createIdentifier('a'),
            '+',
            java.factory.createIdentifier('b'),
          ),
        ),
      ],
      ['public', 'static'],
    );

    const cls = java.factory.createClassDeclaration('Calculator', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'static-method.java');
  });

  it('abstract method', async () => {
    const method = java.factory.createMethodDeclaration(
      'process',
      [java.factory.createMethodParameter('data', java.factory.createIdentifier('String'))],
      java.factory.createIdentifier('String'),
      [], // empty body for abstract method
      ['public', 'abstract'],
    );

    const cls = java.factory.createClassDeclaration('Processor', [method], ['public', 'abstract']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'abstract-method.java');
  });

  it('final method', async () => {
    const method = java.factory.createMethodDeclaration(
      'getVersion',
      [],
      java.factory.createIdentifier('String'),
      [java.factory.createReturnStatement(java.factory.createLiteral('1.0.0'))],
      ['public', 'final'],
    );

    const cls = java.factory.createClassDeclaration('Version', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'final-method.java');
  });

  it('synchronized method', async () => {
    const method = java.factory.createMethodDeclaration(
      'increment',
      [],
      java.factory.createIdentifier('void'),
      [
        java.factory.createAssignment(
          java.factory.createMemberExpression(
            java.factory.createThisExpression(),
            java.factory.createIdentifier('count'),
          ),
          java.factory.createBinaryExpression(
            java.factory.createMemberExpression(
              java.factory.createThisExpression(),
              java.factory.createIdentifier('count'),
            ),
            '+',
            java.factory.createLiteral(1),
          ),
        ),
      ],
      ['public', 'synchronized'],
    );

    const field = java.factory.createVariableDeclaration(
      'count',
      java.factory.createIdentifier('int'),
      java.factory.createLiteral(0),
      ['private'],
    );

    const cls = java.factory.createClassDeclaration('Counter', [field, method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'synchronized-method.java');
  });

  it('native method', async () => {
    const method = java.factory.createMethodDeclaration(
      'nativeMethod',
      [java.factory.createMethodParameter('param', java.factory.createIdentifier('int'))],
      java.factory.createIdentifier('void'),
      [], // native methods have no body
      ['public', 'native'],
    );

    const cls = java.factory.createClassDeclaration('NativeClass', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'native-method.java');
  });

  it('method with throws clause', async () => {
    const method = java.factory.createMethodDeclaration(
      'readFile',
      [java.factory.createMethodParameter('filename', java.factory.createIdentifier('String'))],
      java.factory.createIdentifier('String'),
      [
        java.factory.createThrowStatement(
          java.factory.createNewExpression(java.factory.createIdentifier('IOException'), [
            java.factory.createLiteral('File not found'),
          ]),
        ),
      ],
      ['public'],
      undefined,
      undefined,
      [
        java.factory.createIdentifier('IOException'),
        java.factory.createIdentifier('SecurityException'),
      ],
    );

    const cls = java.factory.createClassDeclaration('FileReader', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'method-with-throws.java');
  });

  it('generic method with type parameters', async () => {
    const T = java.factory.createTypeParameter('T', [java.factory.createIdentifier('Comparable')]);

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
      undefined,
      [T],
    );

    const cls = java.factory.createClassDeclaration('Utils', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'generic-method.java');
  });

  it('method with annotations', async () => {
    const OverrideAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier('Override'),
    );

    const DeprecatedAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier('Deprecated'),
    );

    const method = java.factory.createMethodDeclaration(
      'toString',
      [],
      java.factory.createIdentifier('String'),
      [java.factory.createReturnStatement(java.factory.createLiteral('Object'))],
      ['public'],
      [OverrideAnnotation, DeprecatedAnnotation],
    );

    const cls = java.factory.createClassDeclaration('MyObject', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'annotated-method.java');
  });

  it('method with varargs parameter', async () => {
    const method = java.factory.createMethodDeclaration(
      'printAll',
      [
        java.factory.createMethodParameter('format', java.factory.createIdentifier('String'), [
          'final',
        ]),
        java.factory.createMethodParameter(
          'args',
          java.factory.createIdentifier('Object'),
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
              java.factory.createIdentifier('printf'),
            ),
            [java.factory.createIdentifier('format'), java.factory.createIdentifier('args')],
          ),
        ),
      ],
      ['public', 'static'],
    );

    const cls = java.factory.createClassDeclaration('Printer', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'varargs-method.java');
  });

  it('constructor with this() call', async () => {
    const field = java.factory.createVariableDeclaration(
      'value',
      java.factory.createIdentifier('int'),
      undefined,
      ['private'],
    );

    const constructor1 = java.factory.createMethodDeclaration(
      'MyClass',
      [],
      undefined,
      [
        java.factory.createExpressionStatement(
          java.factory.createCallExpression(java.factory.createThisExpression(), [
            java.factory.createLiteral(0),
          ]),
        ),
      ],
      ['public'],
    );

    const constructor2 = java.factory.createMethodDeclaration(
      'MyClass',
      [java.factory.createMethodParameter('value', java.factory.createIdentifier('int'))],
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

    const cls = java.factory.createClassDeclaration(
      'MyClass',
      [field, constructor1, constructor2],
      ['public'],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'constructor-this-call.java');
  });

  it('method with complex parameter annotations', async () => {
    const NotNullAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier('NotNull'),
    );

    const SizeAnnotation = java.factory.createAnnotation(java.factory.createIdentifier('Size'), [
      { name: 'min', value: java.factory.createLiteral(1) },
      { name: 'max', value: java.factory.createLiteral(100) },
    ]);

    const method = java.factory.createMethodDeclaration(
      'validate',
      [
        java.factory.createMethodParameter(
          'name',
          java.factory.createIdentifier('String'),
          ['final'],
          [NotNullAnnotation, SizeAnnotation],
        ),
        java.factory.createMethodParameter(
          'age',
          java.factory.createIdentifier('int'),
          ['final'],
          [NotNullAnnotation],
        ),
      ],
      java.factory.createIdentifier('boolean'),
      [
        java.factory.createReturnStatement(
          java.factory.createBinaryExpression(
            java.factory.createIdentifier('name'),
            '!=',
            java.factory.createLiteral(null),
          ),
        ),
      ],
      ['public'],
    );

    const cls = java.factory.createClassDeclaration('Validator', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'method-parameter-annotations.java');
  });

  it('method with comments', async () => {
    const method = java.factory.createMethodDeclaration(
      'complexCalculation',
      [java.factory.createMethodParameter('input', java.factory.createIdentifier('double'))],
      java.factory.createIdentifier('double'),
      [
        java.factory.createReturnStatement(
          java.factory.createBinaryExpression(
            java.factory.createIdentifier('input'),
            '*',
            java.factory.createLiteral(2.0),
          ),
        ),
      ],
      ['public'],
      undefined,
      undefined,
      undefined,
      undefined,
      ['// Complex calculation method', '// Performs advanced mathematical operations'],
      ['// End of complex calculation'],
    );

    const cls = java.factory.createClassDeclaration('Calculator', [method], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'method-with-comments.java');
  });
});
