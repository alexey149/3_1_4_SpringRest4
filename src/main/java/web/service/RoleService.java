package web.service;

import web.model.Role;

import java.util.List;

public interface RoleService {
    List<Role> getAllRoles();
    Role getRoleByName(String name);
    void save(Role role);
}