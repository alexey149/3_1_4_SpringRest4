package web.dao;

import web.model.User;

import java.util.List;

public interface UserDao {
    public List<User> getAllUsers();

    public User getUserById(int id);

    public User getUserByUsername(String username);

    public void save(User user);

    public void update(User user);

    public void delete(int id);
}