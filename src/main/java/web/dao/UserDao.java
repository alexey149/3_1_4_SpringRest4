package web.dao;

import web.model.User;

import java.util.List;

public interface UserDao {
    List<User> getAllUsers();

    User getUserById(int id);

    User getUserByUsername(String username);

    void save(User user);

    void update(User user);

    void delete(int id);
}