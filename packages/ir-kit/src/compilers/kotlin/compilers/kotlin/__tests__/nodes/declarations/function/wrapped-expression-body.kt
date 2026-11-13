package com.example

public suspend fun StoreApi.getInventoryWithResponse(): Pair<Map<String, Int>, Response> =
  this.getInventoryWithResponse(options = RequestOptions())
