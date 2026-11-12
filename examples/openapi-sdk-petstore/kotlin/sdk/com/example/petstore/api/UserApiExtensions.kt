package com.example.petstore.api

import com.example.petstore.models.*
import okhttp3.Response

/** POST /user */
public suspend fun UserApi.createUser(body: User): User = this.createUser(body = body, options = RequestOptions())

/** POST /user */
public suspend fun UserApi.createUserWithResponse(body: User): Pair<User, Response> =
    this.createUserWithResponse(body = body, options = RequestOptions())

/** POST /user/createWithList */
public suspend fun UserApi.createUsersWithListInput(body: List<User>): User =
    this.createUsersWithListInput(body = body, options = RequestOptions())

/** POST /user/createWithList */
public suspend fun UserApi.createUsersWithListInputWithResponse(body: List<User>): Pair<User, Response> =
    this.createUsersWithListInputWithResponse(body = body, options = RequestOptions())

/** GET /user/login */
public suspend fun UserApi.loginUser(
    username: String?,
    password: String?,
): String = this.loginUser(username = username, password = password, options = RequestOptions())

/** GET /user/login */
public suspend fun UserApi.loginUserWithResponse(
    username: String?,
    password: String?,
): Pair<String, Response> = this.loginUserWithResponse(username = username, password = password, options = RequestOptions())

/** GET /user/logout */
public suspend fun UserApi.logoutUser() {
    this.logoutUser(options = RequestOptions())
}

/** GET /user/logout */
public suspend fun UserApi.logoutUserWithResponse(): Response = this.logoutUserWithResponse(options = RequestOptions())

/** GET /user/{username} */
public suspend fun UserApi.getUserByName(username: String): User = this.getUserByName(username = username, options = RequestOptions())

/** GET /user/{username} */
public suspend fun UserApi.getUserByNameWithResponse(username: String): Pair<User, Response> =
    this.getUserByNameWithResponse(username = username, options = RequestOptions())

/** PUT /user/{username} */
public suspend fun UserApi.updateUser(
    username: String,
    body: User,
) {
    this.updateUser(username = username, body = body, options = RequestOptions())
}

/** PUT /user/{username} */
public suspend fun UserApi.updateUserWithResponse(
    username: String,
    body: User,
): Response = this.updateUserWithResponse(username = username, body = body, options = RequestOptions())

/** DELETE /user/{username} */
public suspend fun UserApi.deleteUser(username: String) {
    this.deleteUser(username = username, options = RequestOptions())
}

/** DELETE /user/{username} */
public suspend fun UserApi.deleteUserWithResponse(username: String): Response =
    this.deleteUserWithResponse(username = username, options = RequestOptions())

/** POST /profile */
public suspend fun UserApi.updateProfile(body: UpdateProfile_Body): UpdateProfile_Response =
    this.updateProfile(body = body, options = RequestOptions())

/** POST /profile */
public suspend fun UserApi.updateProfileWithResponse(body: UpdateProfile_Body): Pair<UpdateProfile_Response, Response> =
    this.updateProfileWithResponse(body = body, options = RequestOptions())
