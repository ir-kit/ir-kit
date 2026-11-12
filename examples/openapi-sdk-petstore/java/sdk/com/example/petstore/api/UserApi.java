package com.example.petstore.api;

import com.example.petstore.model.UpdateProfileBody;
import com.example.petstore.model.UpdateProfileResponse;
import com.example.petstore.model.User;
import com.example.petstore.runtime.ApiResult;
import com.example.petstore.runtime.RequestOptions;
import java.util.List;

public interface UserApi {
  // POST /user
  User createUser(User body, RequestOptions options);

  default User createUser(User body) {
    return this.createUser(body, RequestOptions.defaults());
  }

  // POST /user
  ApiResult<User> createUserWithResponse(User body, RequestOptions options);

  default ApiResult<User> createUserWithResponse(User body) {
    return this.createUserWithResponse(body, RequestOptions.defaults());
  }

  // POST /user/createWithList
  User createUsersWithListInput(List<User> body, RequestOptions options);

  default User createUsersWithListInput(List<User> body) {
    return this.createUsersWithListInput(body, RequestOptions.defaults());
  }

  // POST /user/createWithList
  ApiResult<User> createUsersWithListInputWithResponse(List<User> body, RequestOptions options);

  default ApiResult<User> createUsersWithListInputWithResponse(List<User> body) {
    return this.createUsersWithListInputWithResponse(body, RequestOptions.defaults());
  }

  // GET /user/login
  String loginUser(String username, String password, RequestOptions options);

  default String loginUser(String username, String password) {
    return this.loginUser(username, password, RequestOptions.defaults());
  }

  // GET /user/login
  ApiResult<String> loginUserWithResponse(String username, String password, RequestOptions options);

  default ApiResult<String> loginUserWithResponse(String username, String password) {
    return this.loginUserWithResponse(username, password, RequestOptions.defaults());
  }

  // GET /user/logout
  void logoutUser(RequestOptions options);

  default void logoutUser() {
    this.logoutUser(RequestOptions.defaults());
  }

  // GET /user/logout
  ApiResult<Void> logoutUserWithResponse(RequestOptions options);

  default ApiResult<Void> logoutUserWithResponse() {
    return this.logoutUserWithResponse(RequestOptions.defaults());
  }

  // GET /user/{username}
  User getUserByName(String username, RequestOptions options);

  default User getUserByName(String username) {
    return this.getUserByName(username, RequestOptions.defaults());
  }

  // GET /user/{username}
  ApiResult<User> getUserByNameWithResponse(String username, RequestOptions options);

  default ApiResult<User> getUserByNameWithResponse(String username) {
    return this.getUserByNameWithResponse(username, RequestOptions.defaults());
  }

  // PUT /user/{username}
  void updateUser(String username, User body, RequestOptions options);

  default void updateUser(String username, User body) {
    this.updateUser(username, body, RequestOptions.defaults());
  }

  // PUT /user/{username}
  ApiResult<Void> updateUserWithResponse(String username, User body, RequestOptions options);

  default ApiResult<Void> updateUserWithResponse(String username, User body) {
    return this.updateUserWithResponse(username, body, RequestOptions.defaults());
  }

  // DELETE /user/{username}
  void deleteUser(String username, RequestOptions options);

  default void deleteUser(String username) {
    this.deleteUser(username, RequestOptions.defaults());
  }

  // DELETE /user/{username}
  ApiResult<Void> deleteUserWithResponse(String username, RequestOptions options);

  default ApiResult<Void> deleteUserWithResponse(String username) {
    return this.deleteUserWithResponse(username, RequestOptions.defaults());
  }

  // POST /profile
  UpdateProfileResponse updateProfile(UpdateProfileBody body, RequestOptions options);

  default UpdateProfileResponse updateProfile(UpdateProfileBody body) {
    return this.updateProfile(body, RequestOptions.defaults());
  }

  // POST /profile
  ApiResult<UpdateProfileResponse> updateProfileWithResponse(
      UpdateProfileBody body, RequestOptions options);

  default ApiResult<UpdateProfileResponse> updateProfileWithResponse(UpdateProfileBody body) {
    return this.updateProfileWithResponse(body, RequestOptions.defaults());
  }
}
