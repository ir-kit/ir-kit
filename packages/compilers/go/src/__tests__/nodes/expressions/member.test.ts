import { go } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('member expression', () => {
  it('simple member', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration(
        'Obj',
        go.factory.createStructType([{ name: 'field', type: go.factory.createIdentifier('int') }]),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'obj',
          go.factory.createCompositeLiteral(
            [
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('field'),
                go.factory.createLiteral(5),
              ),
            ],
            go.factory.createIdentifier('Obj'),
          ),
        ),
        go.factory.createShortVarDeclaration(
          'result',
          go.factory.createMemberExpression(
            go.factory.createIdentifier('obj'),
            go.factory.createIdentifier('field'),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('result')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'simple.go');
  });

  it('nested chain', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration(
        'B',
        go.factory.createStructType([{ name: 'c', type: go.factory.createIdentifier('int') }]),
      ),
      go.factory.createTypeDeclaration(
        'A',
        go.factory.createStructType([{ name: 'b', type: go.factory.createIdentifier('B') }]),
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'a',
          go.factory.createCompositeLiteral(
            [
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('b'),
                go.factory.createCompositeLiteral(
                  [
                    go.factory.createKeyValueExpression(
                      go.factory.createIdentifier('c'),
                      go.factory.createLiteral(7),
                    ),
                  ],
                  go.factory.createIdentifier('B'),
                ),
              ),
            ],
            go.factory.createIdentifier('A'),
          ),
        ),
        go.factory.createShortVarDeclaration(
          'result',
          go.factory.createMemberExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('a'),
              go.factory.createIdentifier('b'),
            ),
            go.factory.createIdentifier('c'),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('result')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'nested.go');
  });

  it('call then member', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration(
        'R',
        go.factory.createStructType([{ name: 'Field', type: go.factory.createIdentifier('int') }]),
      ),
      go.factory.createFunctionDeclaration(
        'get',
        undefined,
        [go.factory.createFunctionReturn(go.factory.createIdentifier('R'))],
        [
          go.factory.createReturnStatement(
            go.factory.createCompositeLiteral(
              [
                go.factory.createKeyValueExpression(
                  go.factory.createIdentifier('Field'),
                  go.factory.createLiteral(99),
                ),
              ],
              go.factory.createIdentifier('R'),
            ),
          ),
        ],
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'result',
          go.factory.createMemberExpression(
            go.factory.createCallExpression(go.factory.createIdentifier('get')),
            go.factory.createIdentifier('Field'),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('result')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'call-then-member.go');
  });
});
