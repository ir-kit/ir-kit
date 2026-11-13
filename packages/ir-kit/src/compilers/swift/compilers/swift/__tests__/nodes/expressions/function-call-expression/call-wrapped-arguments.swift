func send() {
  return try await client.execute(
    request, requestInterceptors: options.requestInterceptors,
    responseValidator: options.responseValidator, responseTransformer: options.responseTransformer
  )
}
