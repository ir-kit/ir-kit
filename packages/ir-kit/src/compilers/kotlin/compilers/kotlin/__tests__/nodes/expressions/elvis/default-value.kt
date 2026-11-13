package com.example

fun name(user: User?): String = user?.name ?: "anon"
