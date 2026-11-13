package com.example.petstore.runtime;

import java.net.http.HttpResponse;

public record ApiResult<T>(T body, HttpResponse<byte[]> response) {}
