package com.example

fun send() {
  return client.execute(
    request,
    timeout = options.timeout,
    extraInterceptors = options.extraInterceptors,
    responseValidator = options.responseValidator,
    responseTransformer = options.responseTransformer,
  )
  return Unit
}
