import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('const declaration', () => {
  it('with type and value', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createConstDeclaration([
        {
          name: 'PI',
          type: go.factory.createIdentifier('float64'),
          value: go.factory.createLiteral(3.14159),
        },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('PI')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-type-and-value.go');
  });

  it('with value only', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createConstDeclaration([
        { name: 'MaxRetries', value: go.factory.createLiteral(5) },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('MaxRetries')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-value-only.go');
  });

  it('string constant', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createConstDeclaration([
        {
          name: 'AppName',
          type: go.factory.createIdentifier('string'),
          value: go.factory.createLiteral('MyApp'),
        },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('AppName')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'string-constant.go');
  });

  it('boolean constant', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createConstDeclaration([
        {
          name: 'Debug',
          type: go.factory.createIdentifier('bool'),
          value: go.factory.createLiteral(true),
        },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createIfStatement(
          go.factory.createIdentifier('Debug'),
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createLiteral('Debug mode')],
              ),
            ),
          ],
          [
            go.factory.createExpressionStatement(
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('fmt'),
                  go.factory.createIdentifier('Println'),
                ),
                [go.factory.createLiteral('Normal mode')],
              ),
            ),
          ],
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'boolean-constant.go');
  });

  it('grouped iota enum', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        { name: 'Status', type: go.factory.createIdentifier('int') },
      ]),
      go.factory.createConstDeclaration([
        {
          name: 'StatusActive',
          type: go.factory.createIdentifier('Status'),
          value: go.factory.createIdentifier('iota'),
        },
        { name: 'StatusInactive' },
        { name: 'StatusPending' },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('StatusActive')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'grouped-iota-enum.go');
  });

  it('grouped typed string enum', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        { name: 'Color', type: go.factory.createIdentifier('string') },
      ]),
      go.factory.createConstDeclaration([
        {
          name: 'ColorRed',
          type: go.factory.createIdentifier('Color'),
          value: go.factory.createLiteral('red'),
        },
        {
          name: 'ColorGreen',
          type: go.factory.createIdentifier('Color'),
          value: go.factory.createLiteral('green'),
        },
        {
          name: 'ColorBlue',
          type: go.factory.createIdentifier('Color'),
          value: go.factory.createLiteral('blue'),
        },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('ColorRed')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'grouped-typed-string-enum.go');
  });

  it('grouped untyped values align', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createConstDeclaration([
        { name: 'X', value: go.factory.createLiteral(1) },
        { name: 'YY', value: go.factory.createLiteral(22) },
        { name: 'ZZZ', value: go.factory.createLiteral(333) },
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('X')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'grouped-untyped-values.go');
  });
});
