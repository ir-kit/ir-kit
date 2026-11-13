public @interface MyAnno {
  String value();

  boolean flag() default true;
}
