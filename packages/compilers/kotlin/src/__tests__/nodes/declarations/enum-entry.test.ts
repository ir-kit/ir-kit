import { assertPrintedMatchesSnapshot, f, file, t } from '../utils';

describe('enum entry', () => {
  it('plain entries', async () => {
    const node = f.createClassDeclaration(
      'Status',
      undefined,
      undefined,
      ['enum'],
      undefined,
      undefined,
      [f.createEnumEntry('ACTIVE'), f.createEnumEntry('INACTIVE'), f.createEnumEntry('PENDING')],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'plain.kt');
  });

  it('entries with value arguments', async () => {
    const entry = (name: string, rgb: string) =>
      f.createEnumEntry(name, [{ expression: f.createLiteral(rgb, 'int') }]);
    const node = f.createClassDeclaration(
      'Color',
      f.createPrimaryConstructor([f.createParameter('rgb', t('Int'), undefined, 'val')]),
      undefined,
      ['enum'],
      undefined,
      undefined,
      [entry('RED', '0xFF0000'), entry('GREEN', '0x00FF00'), entry('BLUE', '0x0000FF')],
    );
    await assertPrintedMatchesSnapshot(file([node]), 'value-arguments.kt');
  });
});
