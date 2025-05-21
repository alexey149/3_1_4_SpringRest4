package web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import web.model.Role;
import web.model.User;
import web.service.RoleService;
import web.service.UserService;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api")
public class RestApiController {

    private final UserService userService;
    private final RoleService roleService;

    @Autowired
    public RestApiController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    // Получение всех пользователей
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // Получение пользователя по ID
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id) {
        User user = userService.getUserById(id);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    // Получение текущего пользователя
    @GetMapping("/user/current")
    public ResponseEntity<User> getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }

            String username = auth.getName();
            User user = userService.getUserByUsername(username);

            if (user == null) {
                System.out.println("Пользователь с именем '" + username + "' не найден в базе данных");
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("Ошибка при получении текущего пользователя: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Получение всех ролей
    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }

    // Создание нового пользователя
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user, @RequestParam(value = "roles", required = false) String[] roleNames) {
        try {
            System.out.println("Creating user with roles: " + (roleNames != null ? String.join(", ", roleNames) : "null"));

            // Проверка на пустой пароль
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            // Если роли указаны, добавляем их
            if (roleNames != null && roleNames.length > 0) {
                Set<Role> roles = new HashSet<>();
                for (String roleName : roleNames) {
                    Role role = roleService.getRoleByName(roleName);
                    if (role != null) {
                        System.out.println("Adding role: " + role.getName());
                        roles.add(role);
                    } else {
                        System.out.println("Role not found: " + roleName);
                    }
                }
                user.setRoles(roles);
            } else {
                // Если роли не указаны, добавляем ROLE_USER по умолчанию
                Set<Role> roles = new HashSet<>();
                Role userRole = roleService.getRoleByName("ROLE_USER");
                if (userRole != null) {
                    System.out.println("Adding default role: " + userRole.getName());
                    roles.add(userRole);
                } else {
                    System.out.println("Default role ROLE_USER not found");
                }
                user.setRoles(roles);
            }

            userService.save(user);
            return new ResponseEntity<>(user, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Обновление пользователя
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable int id, @RequestBody User user,
                                           @RequestParam(value = "roles", required = false) String[] roleNames) {
        try {
            System.out.println("Updating user " + id + " with roles: " + (roleNames != null ? String.join(", ", roleNames) : "null"));

            User existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Устанавливаем ID из URL
            user.setId(id);

            // Если роли указаны, добавляем их
            if (roleNames != null && roleNames.length > 0) {
                Set<Role> roles = new HashSet<>();
                for (String roleName : roleNames) {
                    Role role = roleService.getRoleByName(roleName);
                    if (role != null) {
                        System.out.println("Adding role: " + role.getName());
                        roles.add(role);
                    } else {
                        System.out.println("Role not found: " + roleName);
                    }
                }
                user.setRoles(roles);
            } else {
                // Если роли не указаны, добавляем ROLE_USER по умолчанию
                Set<Role> roles = new HashSet<>();
                Role userRole = roleService.getRoleByName("ROLE_USER");
                if (userRole != null) {
                    System.out.println("Adding default role: " + userRole.getName());
                    roles.add(userRole);
                } else {
                    System.out.println("Default role ROLE_USER not found");
                }
                user.setRoles(roles);
            }

            // Если пароль пустой, сохраняем старый пароль
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                user.setPassword(existingUser.getPassword());
            }

            userService.save(user);

            // Печатаем информацию о сохраненном пользователе
            User savedUser = userService.getUserById(id);
            if (savedUser != null && savedUser.getRoles() != null) {
                System.out.println("Saved user with roles: ");
                for (Role role : savedUser.getRoles()) {
                    System.out.println(" - " + role.getName());
                }
            }

            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Удаление пользователя
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        try {
            User user = userService.getUserById(id);
            if (user == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            userService.delete(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}