import { assertPrintedMatchesSnapshot, f, file, id } from '../utils';

const call = (name: string, args: Parameters<typeof f.createCallExpression>[1] = []) =>
  f.createCallExpression(id(name), args);
const stmt = (e: Parameters<typeof f.createExpressionStatement>[0]) =>
  f.createExpressionStatement(e);

describe('for statement', () => {
  it('single loop variable', async () => {
    const node = f.createFunctionDeclaration(
      'printAll',
      [f.createParameter('items', f.createUserType('List', [f.createUserType('String')]))],
      undefined,
      [
        f.createForStatement(
          ['item'],
          id('items'),
          f.createBlock([stmt(call('println', [{ expression: id('item') }]))]),
        ),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'single.kt');
  });

  it('destructuring over a map', async () => {
    const node = f.createFunctionDeclaration(
      'dump',
      [
        f.createParameter(
          'map',
          f.createUserType('Map', [f.createUserType('String'), f.createUserType('Int')]),
        ),
      ],
      undefined,
      [
        f.createForStatement(
          ['key', 'value'],
          id('map'),
          f.createBlock([
            stmt(
              call('println', [
                {
                  expression: f.createStringLiteral([
                    { expression: id('key') },
                    { text: '=' },
                    { expression: id('value') },
                  ]),
                },
              ]),
            ),
          ]),
        ),
      ],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'destructuring.kt');
  });
});
