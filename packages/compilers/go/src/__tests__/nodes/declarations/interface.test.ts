import { go } from '../../..';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('interface type via type declaration', () => {
  it('empty interface', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration('Any', go.factory.createInterfaceType([])),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createVarDeclaration(
          'x',
          go.factory.createIdentifier('Any'),
          go.factory.createLiteral(123),
        ),
        go.factory.createEmptyStatement(),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('x')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'empty.go');
  });

  it('single method with named returns', async () => {
    const reader = go.factory.createInterfaceType([
      {
        name: 'Read',
        parameters: [
          go.factory.createFunctionParameter(
            ['p'],
            go.factory.createArrayType(go.factory.createIdentifier('byte')),
          ),
        ],
        returnType: [
          go.factory.createFunctionReturn(go.factory.createIdentifier('int'), 'n'),
          go.factory.createFunctionReturn(go.factory.createIdentifier('error'), 'err'),
        ],
      },
    ]);

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration('Reader', reader),
      // concrete type implementing Reader
      go.factory.createTypeDeclaration('MemReader', go.factory.createStructType([])),
      go.factory.createFunctionDeclaration(
        'Read',
        [
          go.factory.createFunctionParameter(
            ['p'],
            go.factory.createArrayType(go.factory.createIdentifier('byte')),
          ),
        ],
        [
          go.factory.createFunctionReturn(go.factory.createIdentifier('int'), 'n'),
          go.factory.createFunctionReturn(go.factory.createIdentifier('error'), 'err'),
        ],
        [
          go.factory.createReturnStatement([
            go.factory.createLiteral(0),
            go.factory.createLiteral(null),
          ]),
        ],
        {
          name: 'm',
          type: go.factory.createIdentifier('MemReader'),
        },
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'buf',
          go.factory.createCompositeLiteral(
            [],
            go.factory.createArrayType(go.factory.createIdentifier('byte')),
          ),
        ),
        go.factory.createShortVarDeclaration(
          ['r'],
          go.factory.createCompositeLiteral([], go.factory.createIdentifier('MemReader')),
        ),
        go.factory.createEmptyStatement(),
        go.factory.createShortVarDeclaration(
          ['n', 'err'],
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('r'),
              go.factory.createIdentifier('Read'),
            ),
            [go.factory.createIdentifier('buf')],
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('n'), go.factory.createIdentifier('err')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'single-method.go');
  });

  it('multiple methods with and without returns', async () => {
    const shape = go.factory.createInterfaceType([
      {
        name: 'Area',
        parameters: [],
        returnType: [go.factory.createFunctionReturn(go.factory.createIdentifier('float64'))],
      },
      {
        name: 'Scale',
        parameters: [
          go.factory.createFunctionParameter(['factor'], go.factory.createIdentifier('float64')),
        ],
        returnType: [],
      },
      {
        name: 'Move',
        parameters: [
          go.factory.createFunctionParameter(['x'], go.factory.createIdentifier('int')),
          go.factory.createFunctionParameter(['y'], go.factory.createIdentifier('int')),
        ],
        returnType: [],
      },
    ]);

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration('Shape', shape),
      go.factory.createTypeDeclaration(
        'Rectangle',
        go.factory.createStructType([
          { names: ['W'], type: go.factory.createIdentifier('float64') },
          { names: ['H'], type: go.factory.createIdentifier('float64') },
        ]),
      ),
      go.factory.createFunctionDeclaration(
        'Area',
        [],
        [go.factory.createFunctionReturn(go.factory.createIdentifier('float64'))],
        [
          go.factory.createReturnStatement(
            go.factory.createBinaryExpression(
              go.factory.createBinaryExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('r'),
                  go.factory.createIdentifier('W'),
                ),
                '*',
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('r'),
                  go.factory.createIdentifier('H'),
                ),
              ),
              '*',
              go.factory.createLiteral(0.5),
            ),
          ),
        ],
        {
          name: 'r',
          type: go.factory.createIdentifier('Rectangle'),
        },
      ),
      go.factory.createFunctionDeclaration(
        'Scale',
        [go.factory.createFunctionParameter(['factor'], go.factory.createIdentifier('float64'))],
        [],
        [
          go.factory.createAugmentAssignment(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('r'),
              go.factory.createIdentifier('W'),
            ),
            '*=',
            go.factory.createIdentifier('factor'),
          ),
          go.factory.createAugmentAssignment(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('r'),
              go.factory.createIdentifier('H'),
            ),
            '*=',
            go.factory.createIdentifier('factor'),
          ),
        ],
        {
          name: 'r',
          type: go.factory.createIdentifier('Rectangle'),
        },
      ),
      go.factory.createFunctionDeclaration(
        'Move',
        [
          go.factory.createFunctionParameter(['x'], go.factory.createIdentifier('int')),
          go.factory.createFunctionParameter(['y'], go.factory.createIdentifier('int')),
        ],
        undefined,
        [
          go.factory.createExpressionStatement(
            go.factory.createCallExpression(
              go.factory.createMemberExpression(
                go.factory.createIdentifier('fmt'),
                go.factory.createIdentifier('Printf'),
              ),
              [
                go.factory.createLiteral('Moved to (%d, %d)'),
                go.factory.createIdentifier('x'),
                go.factory.createIdentifier('y'),
              ],
            ),
          ),
        ],
        {
          name: 'r',
          type: go.factory.createIdentifier('Rectangle'),
        },
      ),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          's',
          go.factory.createCompositeLiteral(
            [
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('W'),
                go.factory.createLiteral(3),
              ),
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('H'),
                go.factory.createLiteral(4),
              ),
            ],
            go.factory.createIdentifier('Rectangle'),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('s'),
              go.factory.createIdentifier('Scale'),
            ),
            [go.factory.createLiteral(2)],
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [
              go.factory.createCallExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('s'),
                  go.factory.createIdentifier('Area'),
                ),
              ),
            ],
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('s'),
              go.factory.createIdentifier('Move'),
            ),
            [go.factory.createLiteral(1), go.factory.createLiteral(2)],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'multiple-methods.go');
  });

  it('embedded interface', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('io'),
      go.factory.createTypeDeclaration(
        'ReadWriter',
        go.factory.createInterfaceType([
          {
            embed: go.factory.createMemberExpression(
              go.factory.createIdentifier('io'),
              go.factory.createIdentifier('Reader'),
            ),
          },
          {
            name: 'Write',
            parameters: [
              go.factory.createFunctionParameter(
                ['p'],
                go.factory.createArrayType(go.factory.createIdentifier('byte')),
              ),
            ],
            returnType: [
              go.factory.createFunctionReturn(go.factory.createIdentifier('int'), 'n'),
              go.factory.createFunctionReturn(go.factory.createIdentifier('error'), 'err'),
            ],
          },
        ]),
      ),
    ]);
    await assertPrintedMatchesSnapshot(file, 'embedded.go');
  });
});
