import { java } from '../../../index';
import { assertPrintedMatchesSnapshot } from '../utils';

describe('variable declarations', () => {
  it('simple field declaration', async () => {
    const field = java.factory.createVariableDeclaration(
      'name',
      java.factory.createIdentifier('String'),
      undefined,
      ['private'],
    );

    const cls = java.factory.createClassDeclaration('Person', [field], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'simple-field.java');
  });

  it('field with initial value', async () => {
    const field = java.factory.createVariableDeclaration(
      'count',
      java.factory.createIdentifier('int'),
      java.factory.createLiteral(0),
      ['private'],
    );

    const cls = java.factory.createClassDeclaration('Counter', [field], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'field-with-value.java');
  });

  it('static final field', async () => {
    const field = java.factory.createVariableDeclaration(
      'MAX_SIZE',
      java.factory.createIdentifier('int'),
      java.factory.createLiteral(1000),
      ['public', 'static', 'final'],
    );

    const cls = java.factory.createClassDeclaration('Constants', [field], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'static-final-field.java');
  });

  it('volatile field', async () => {
    const field = java.factory.createVariableDeclaration(
      'flag',
      java.factory.createIdentifier('boolean'),
      java.factory.createLiteral(false),
      ['private', 'volatile'],
    );

    const cls = java.factory.createClassDeclaration('ThreadSafe', [field], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'volatile-field.java');
  });

  it('field with complex type', async () => {
    const field = java.factory.createVariableDeclaration(
      'list',
      java.factory.createParameterizedType(java.factory.createIdentifier('List'), [
        java.factory.createIdentifier('String'),
      ]),
      java.factory.createNewExpression(
        java.factory.createParameterizedType(java.factory.createIdentifier('ArrayList'), [
          java.factory.createIdentifier('String'),
        ]),
        [],
      ),
      ['private'],
    );

    const cls = java.factory.createClassDeclaration('DataHolder', [field], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'complex-type-field.java');
  });

  it('field with annotations', async () => {
    const EntityAnnotation = java.factory.createAnnotation(java.factory.createIdentifier('Entity'));

    const ColumnAnnotation = java.factory.createAnnotation(
      java.factory.createIdentifier('Column'),
      [{ name: 'name', value: java.factory.createLiteral('user_id') }],
    );

    const field = java.factory.createVariableDeclaration(
      'id',
      java.factory.createIdentifier('Long'),
      undefined,
      ['private'],
      [EntityAnnotation, ColumnAnnotation],
    );

    const cls = java.factory.createClassDeclaration('User', [field], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'annotated-field.java');
  });

  it('field with comments', async () => {
    const field = java.factory.createVariableDeclaration(
      'cache',
      java.factory.createIdentifier('Map'),
      undefined,
      ['private', 'final'],
      undefined,
      ['// Cache for storing temporary data', '// Thread-safe implementation'],
      ['// End of cache field'],
    );

    const cls = java.factory.createClassDeclaration('CacheManager', [field], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'field-with-comments.java');
  });

  it('multiple fields with different modifiers', async () => {
    const publicField = java.factory.createVariableDeclaration(
      'publicValue',
      java.factory.createIdentifier('String'),
      java.factory.createLiteral('public'),
      ['public'],
    );

    const protectedField = java.factory.createVariableDeclaration(
      'protectedValue',
      java.factory.createIdentifier('String'),
      java.factory.createLiteral('protected'),
      ['protected'],
    );

    const privateField = java.factory.createVariableDeclaration(
      'privateValue',
      java.factory.createIdentifier('String'),
      java.factory.createLiteral('private'),
      ['private'],
    );

    const packageField = java.factory.createVariableDeclaration(
      'packageValue',
      java.factory.createIdentifier('String'),
      java.factory.createLiteral('package'),
      [], // package-private
    );

    const cls = java.factory.createClassDeclaration(
      'AccessModifiers',
      [publicField, protectedField, privateField, packageField],
      ['public'],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'multiple-fields.java');
  });

  it('field with generic type', async () => {
    const field = java.factory.createVariableDeclaration(
      'items',
      java.factory.createParameterizedType(java.factory.createIdentifier('List'), [
        java.factory.createIdentifier('T'),
      ]),
      undefined,
      ['private'],
    );

    const T = java.factory.createTypeParameter('T');

    const cls = java.factory.createClassDeclaration(
      'GenericContainer',
      [field],
      ['public'],
      undefined,
      undefined,
      undefined,
      [T],
    );

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'generic-field.java');
  });

  it('field with array type', async () => {
    const field = java.factory.createVariableDeclaration(
      'numbers',
      java.factory.createArrayType(java.factory.createIdentifier('int'), 1),
      java.factory.createArrayInitializer([
        java.factory.createLiteral(1),
        java.factory.createLiteral(2),
        java.factory.createLiteral(3),
      ]),
      ['private'],
    );

    const cls = java.factory.createClassDeclaration('ArrayHolder', [field], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'array-field.java');
  });

  it('field with complex initialization', async () => {
    const field = java.factory.createVariableDeclaration(
      'config',
      java.factory.createIdentifier('Properties'),
      java.factory.createCallExpression(
        java.factory.createMemberExpression(
          java.factory.createIdentifier('System'),
          java.factory.createIdentifier('getProperties'),
        ),
        [],
      ),
      ['private', 'static', 'final'],
    );

    const cls = java.factory.createClassDeclaration('Configuration', [field], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'complex-initialization-field.java');
  });

  it('field with ternary initialization', async () => {
    const field = java.factory.createVariableDeclaration(
      'status',
      java.factory.createIdentifier('String'),
      java.factory.createTernaryExpression(
        java.factory.createBinaryExpression(
          java.factory.createIdentifier('isActive'),
          '==',
          java.factory.createLiteral(true),
        ),
        java.factory.createLiteral('active'),
        java.factory.createLiteral('inactive'),
      ),
      ['private'],
    );

    const cls = java.factory.createClassDeclaration('StatusHolder', [field], ['public']);

    const file = java.factory.createSourceFile(undefined, [cls]);
    await assertPrintedMatchesSnapshot(file, 'ternary-initialization-field.java');
  });
});
