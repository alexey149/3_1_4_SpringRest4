package web.service;

import web.model.User;

import java.util.List;

public interface UserService {
    List<User> getAllUsers();

    User getUserById(int id);

    User getUserByUsername(String username);

    void save(User user);

    void update(User user);

    void delete(int id);
}