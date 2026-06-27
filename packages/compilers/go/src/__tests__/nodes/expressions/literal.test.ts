import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('literal', () => {
  it('string', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('message', go.factory.createLiteral('Hello, World!')),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('message')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'string.go');
  });

  it('string with escapes', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'message',
          go.factory.createLiteral('say "hi"\tand\\or\nbye'),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('message')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'string-with-escapes.go');
  });

  it('number', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('count', go.factory.createLiteral(42)),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('count')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'number.go');
  });

  it('boolean true', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('isActive', go.factory.createLiteral(true)),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('isActive')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'boolean-true.go');
  });

  it('boolean false', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('isActive', go.factory.createLiteral(false)),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('isActive')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'boolean-false.go');
  });

  it('null', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVarDeclaration([
          {
            name: 'value',
            type: go.factory.createInterfaceType(undefined),
            value: go.factory.createLiteral(null),
          },
        ]),
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
    await assertPrintedMatchesSnapshot(file, 'null.go');
  });

  it('integer formats preserved', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('hex', go.factory.createLiteral('0xFF', 'int')),
        go.factory.createShortVarDeclaration(
          'grouped',
          go.factory.createLiteral('1_000_000', 'int'),
        ),
        go.factory.createShortVarDeclaration('exp', go.factory.createLiteral('1e9', 'float')),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [
              go.factory.createIdentifier('hex'),
              go.factory.createIdentifier('grouped'),
              go.factory.createIdentifier('exp'),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'integer-formats.go');
  });

  it('large integer keeps precision', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'big',
          go.factory.createLiteral('9007199254740993', 'int'),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('big')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'large-integer.go');
  });

  it('rune and imaginary', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('letter', go.factory.createLiteral('a', 'rune')),
        go.factory.createShortVarDeclaration('z', go.factory.createLiteral('3i', 'imaginary')),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('letter'), go.factory.createIdentifier('z')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'rune-imaginary.go');
  });

  it('raw string keeps content verbatim', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'pattern',
          go.factory.createLiteral('\\d+\\s*"quoted"', 'rawString'),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('pattern')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'raw-string.go');
  });
});
