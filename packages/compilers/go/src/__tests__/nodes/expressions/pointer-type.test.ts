import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('pointer type', () => {
  it('struct fields', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([
        go.factory.createTypeSpec(
          'User',
          go.factory.createStructType([
            {
              names: ['Name'],
              tag: 'json:"name,omitempty"',
              type: go.factory.createPointerType(go.factory.createIdentifier('string')),
            },
            {
              names: ['Owner'],
              tag: 'json:"owner,omitempty"',
              type: go.factory.createPointerType(go.factory.createIdentifier('User')),
            },
          ]),
        ),
      ]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('name', go.factory.createLiteral('Bob')),
        go.factory.createShortVarDeclaration(
          'u',
          go.factory.createCompositeLiteral(
            [
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('Name'),
                go.factory.createUnaryExpression('&', go.factory.createIdentifier('name')),
              ),
            ],
            go.factory.createIdentifier('User'),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('u')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'struct-fields.go');
  });

  it('parameter and return type', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(
        'find',
        [
          go.factory.createFunctionParameter(
            ['id'],
            go.factory.createPointerType(go.factory.createIdentifier('int')),
          ),
        ],
        [
          go.factory.createFunctionReturn(
            go.factory.createPointerType(go.factory.createIdentifier('User')),
          ),
        ],
        [go.factory.createReturnStatement([go.factory.createLiteral(null)])],
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration('id', go.factory.createLiteral(1)),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [
              go.factory.createCallExpression(go.factory.createIdentifier('find'), [
                go.factory.createUnaryExpression('&', go.factory.createIdentifier('id')),
              ]),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'param-and-return.go');
  });

  it('pointer to pointer', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVariableStatement(
          undefined,
          go.factory.createVariableDeclarationList(
            [
              go.factory.createVariableDeclaration(
                'pp',
                go.factory.createPointerType(
                  go.factory.createPointerType(go.factory.createIdentifier('int')),
                ),
              ),
            ],
            go.NodeFlags.Var,
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('pp')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'pointer-to-pointer.go');
  });
});
