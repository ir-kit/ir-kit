import { assertPrintedMatchesSnapshot, f, file, id, t } from '../utils';

describe('property', () => {
  it('val with initializer', async () => {
    const node = f.createProperty(
      'baseUrl',
      'val',
      t('String'),
      f.createStringLiteral([{ text: 'https://api.example.com' }]),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'initializer.kt');
  });

  it('property with a custom getter', async () => {
    const node = f.createProperty('isReady', 'val', t('Boolean'), undefined, [
      { expressionBody: f.createLiteral('true', 'boolean'), isGetter: true },
    ]);
    await assertPrintedMatchesSnapshot(file([node]), 'custom-getter.kt');
  });

  it('delegated property', async () => {
    const node = f.createProperty(
      'settings',
      'val',
      t('Settings'),
      undefined,
      undefined,
      undefined,
      undefined,
      f.createCallExpression(
        id('lazy'),
        undefined,
        undefined,
        f.createLambdaExpression([f.createExpressionStatement(f.createCallExpression(id('load')))]),
      ),
    );
    await assertPrintedMatchesSnapshot(file([node]), 'delegated.kt');
  });
});
