import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('const declaration', () => {
  it('with type and value', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createConstDeclaration(
        'PI',
        go.factory.createLiteral(3.14159),
        go.factory.createIdentifier('float64'),
      ),
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
      go.factory.createConstDeclaration('MaxRetries', go.factory.createLiteral(5)),
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
      go.factory.createConstDeclaration(
        'AppName',
        go.factory.createLiteral('MyApp'),
        go.factory.createIdentifier('string'),
      ),
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
      go.factory.createConstDeclaration(
        'Debug',
        go.factory.createLiteral(true),
        go.factory.createIdentifier('bool'),
      ),
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
});
