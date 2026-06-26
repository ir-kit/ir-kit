import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('call expression', () => {
  it('function with no arguments', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(
        'getValue',
        undefined,
        [go.factory.createFunctionReturn(go.factory.createIdentifier('int'))],
        [go.factory.createReturnStatement(go.factory.createLiteral(7))],
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createCallExpression(go.factory.createIdentifier('getValue'), [])],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'no-arguments.go');
  });

  it('function with single argument', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(
        'process',
        [go.factory.createFunctionParameter(['input'], go.factory.createIdentifier('int'))],
        [go.factory.createFunctionReturn(go.factory.createIdentifier('int'))],
        [go.factory.createReturnStatement(go.factory.createIdentifier('input'))],
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [
              go.factory.createCallExpression(go.factory.createIdentifier('process'), [
                go.factory.createLiteral(3),
              ]),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'single-argument.go');
  });

  it('function with multiple arguments', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(
        'add',
        [
          go.factory.createFunctionParameter(['a'], go.factory.createIdentifier('int')),
          go.factory.createFunctionParameter(['b'], go.factory.createIdentifier('int')),
          go.factory.createFunctionParameter(['c'], go.factory.createIdentifier('int')),
        ],
        [go.factory.createFunctionReturn(go.factory.createIdentifier('int'))],
        [
          go.factory.createReturnStatement(
            go.factory.createBinaryExpression(
              go.factory.createBinaryExpression(
                go.factory.createIdentifier('a'),
                '+',
                go.factory.createIdentifier('b'),
              ),
              '+',
              go.factory.createIdentifier('c'),
            ),
          ),
        ],
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [
              go.factory.createCallExpression(go.factory.createIdentifier('add'), [
                go.factory.createLiteral(5),
                go.factory.createLiteral(10),
                go.factory.createLiteral(1),
              ]),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'multiple-arguments.go');
  });

  it('nested function calls', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration(
        'inner',
        [go.factory.createFunctionParameter(['s'], go.factory.createIdentifier('string'))],
        [go.factory.createFunctionReturn(go.factory.createIdentifier('string'))],
        [go.factory.createReturnStatement(go.factory.createIdentifier('s'))],
      ),
      go.factory.createFunctionDeclaration(
        'outer',
        [go.factory.createFunctionParameter(['s'], go.factory.createIdentifier('string'))],
        [go.factory.createFunctionReturn(go.factory.createIdentifier('string'))],
        [
          go.factory.createReturnStatement(
            go.factory.createBinaryExpression(
              go.factory.createIdentifier('s'),
              '+',
              go.factory.createLiteral('!'),
            ),
          ),
        ],
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [
              go.factory.createCallExpression(go.factory.createIdentifier('outer'), [
                go.factory.createCallExpression(go.factory.createIdentifier('inner'), [
                  go.factory.createLiteral('test'),
                ]),
              ]),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'nested-calls.go');
  });

  it('prints last arg with ...', async () => {
    const callee = go.factory.createMemberExpression(
      go.factory.createIdentifier('fmt'),
      go.factory.createIdentifier('Println'),
    );
    const args = [go.factory.createIdentifier('xs')];
    const call = go.factory.createCallExpression(callee, args, true);

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'xs',
          go.factory.createCompositeLiteral(
            [
              go.factory.createLiteral(1),
              go.factory.createLiteral('Hi'),
              go.factory.createLiteral(3),
            ],
            go.factory.createArrayType(go.factory.createIdentifier('any')),
          ),
        ),
        go.factory.createExpressionStatement(call),
      ]),
    ]);

    await assertPrintedMatchesSnapshot(file, 'call-spread.go');
  });
});
