public @interface ComplexAnnotation {
  String value();
  int count() default 1;
  boolean enabled() default true;
  String[] tags() default {  };
}
