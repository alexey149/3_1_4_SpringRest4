package web.dao;

import web.model.Role;

import java.util.List;

public interface RoleDao {
    List<Role> getAllRoles();
    Role getRoleByName(String name);
    void save(Role role);
}