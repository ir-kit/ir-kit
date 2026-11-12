package com.example.petstore.runtime;

import java.net.http.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.function.UnaryOperator;

public final class ApiInterceptors {
  public final List<UnaryOperator<HttpRequest.Builder>> request = new ArrayList<>();
}
