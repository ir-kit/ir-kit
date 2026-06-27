import { go } from '../../..';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('struct type via type declaration', () => {
  it('empty struct', async () => {
    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([{ name: 'Empty', type: go.factory.createStructType([]) }]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'e',
          go.factory.createCompositeLiteral([], go.factory.createIdentifier('Empty')),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [go.factory.createIdentifier('e')],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'empty.go');
  });

  it('with fields', async () => {
    const userStruct = go.factory.createStructType([
      { names: ['ID'], type: go.factory.createIdentifier('int') },
      { names: ['Name'], type: go.factory.createIdentifier('string') },
    ]);

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([{ name: 'User', type: userStruct }]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'u',
          go.factory.createCompositeLiteral(
            [
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('ID'),
                go.factory.createLiteral(1),
              ),
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('Name'),
                go.factory.createLiteral('Alice'),
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
            [
              go.factory.createMemberExpression(
                go.factory.createIdentifier('u'),
                go.factory.createIdentifier('Name'),
              ),
              go.factory.createMemberExpression(
                go.factory.createIdentifier('u'),
                go.factory.createIdentifier('ID'),
              ),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'with-fields.go');
  });

  it('with tags', async () => {
    const userStructWithTags = go.factory.createStructType([
      {
        names: ['ID'],
        tag: 'json:"id"',
        type: go.factory.createIdentifier('int'),
      },
      {
        names: ['Name'],
        tag: 'json:"name,omitempty"',
        type: go.factory.createIdentifier('string'),
      },
    ]);

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([{ name: 'User', type: userStructWithTags }]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'u',
          go.factory.createCompositeLiteral(
            [
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('ID'),
                go.factory.createLiteral(1),
              ),
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('Name'),
                go.factory.createLiteral('Bob'),
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
    await assertPrintedMatchesSnapshot(file, 'with-tags.go');
  });

  it('nested struct', async () => {
    const address = go.factory.createStructType([
      {
        names: ['City'],
        tag: 'json:"city"',
        type: go.factory.createIdentifier('string'),
      },
    ]);

    const nested = go.factory.createStructType([
      {
        names: ['Name'],
        tag: 'json:"name"',
        type: go.factory.createIdentifier('string'),
      },
      {
        names: ['Address'],
        tag: 'json:"address"',
        type: address,
      },
    ]);

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([{ name: 'Address', type: address }]),
      go.factory.createTypeDeclaration([{ name: 'User', type: nested }]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'u',
          go.factory.createCompositeLiteral(
            [
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('Name'),
                go.factory.createLiteral('Eve'),
              ),
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('Address'),
                go.factory.createCompositeLiteral(
                  [
                    go.factory.createKeyValueExpression(
                      go.factory.createIdentifier('City'),
                      go.factory.createLiteral('Paris'),
                    ),
                  ],
                  go.factory.createIdentifier('Address'),
                ),
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
            [
              go.factory.createMemberExpression(
                go.factory.createIdentifier('u'),
                go.factory.createIdentifier('Name'),
              ),
              go.factory.createMemberExpression(
                go.factory.createMemberExpression(
                  go.factory.createIdentifier('u'),
                  go.factory.createIdentifier('Address'),
                ),
                go.factory.createIdentifier('City'),
              ),
            ],
          ),
        ),
      ]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'nested.go');
  });

  it('embedded anonymous field', async () => {
    const person = go.factory.createStructType([
      { names: ['Name'], type: go.factory.createIdentifier('string') },
      { names: ['Age'], type: go.factory.createIdentifier('int') },
    ]);

    const employee = go.factory.createStructType([
      { type: go.factory.createIdentifier('Person') },
      { names: ['Salary'], type: go.factory.createIdentifier('float64') },
    ]);

    const file = go.factory.createSourceFile('main', [
      go.factory.createImportStatement('fmt'),
      go.factory.createTypeDeclaration([{ name: 'Person', type: person }]),
      go.factory.createTypeDeclaration([{ name: 'Employee', type: employee }]),
      go.factory.createFunctionDeclaration('main', undefined, undefined, [
        go.factory.createShortVarDeclaration(
          'e',
          go.factory.createCompositeLiteral(
            [
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('Person'),
                go.factory.createCompositeLiteral(
                  [
                    go.factory.createKeyValueExpression(
                      go.factory.createIdentifier('Name'),
                      go.factory.createLiteral('Zoe'),
                    ),
                    go.factory.createKeyValueExpression(
                      go.factory.createIdentifier('Age'),
                      go.factory.createLiteral(30),
                    ),
                  ],
                  go.factory.createIdentifier('Person'),
                ),
              ),
              go.factory.createKeyValueExpression(
                go.factory.createIdentifier('Salary'),
                go.factory.createLiteral(1000),
              ),
            ],
            go.factory.createIdentifier('Employee'),
          ),
        ),
        go.factory.createExpressionStatement(
          go.factory.createCallExpression(
            go.factory.createMemberExpression(
              go.factory.createIdentifier('fmt'),
              go.factory.createIdentifier('Println'),
            ),
            [
              go.factory.createMemberExpression(
                go.factory.createIdentifier('e'),
                go.factory.createIdentifier('Name'),
              ),
              go.factory.createMemberExpression(
                go.factory.createIdentifier('e'),
                go.factory.createIdentifier('Salary'),
              ),
            ],
          ),
        ),
      ]),
    ]);

    await assertPrintedMatchesSnapshot(file, 'embedded.go');
  });

  it('grouped field names', async () => {
    const point = go.factory.createStructType([
      { names: ['X', 'Y'], type: go.factory.createIdentifier('int') },
      { names: ['Label'], tag: 'json:"label"', type: go.factory.createIdentifier('string') },
    ]);
    const file = go.factory.createSourceFile('main', [
      go.factory.createTypeDeclaration([{ name: 'Point', type: point }]),
    ]);
    await assertPrintedMatchesSnapshot(file, 'grouped-field-names.go');
  });
});
