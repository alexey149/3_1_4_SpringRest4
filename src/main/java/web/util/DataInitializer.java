package web.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import web.model.Role;
import web.model.User;
import web.service.RoleService;
import web.service.UserService;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final RoleService roleService;

    @Autowired
    public DataInitializer(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Проверяем, нужна ли инициализация данных
        if (roleService.getAllRoles().isEmpty()) {
            System.out.println("Initializing roles and users...");

            // Создаем роли
            Role adminRole = new Role("ROLE_ADMIN");
            Role userRole = new Role("ROLE_USER");

            roleService.save(adminRole);
            roleService.save(userRole);

            // Получаем роли из базы данных после сохранения
            Role adminRoleFromDb = roleService.getRoleByName("ROLE_ADMIN");
            Role userRoleFromDb = roleService.getRoleByName("ROLE_USER");

            // Создаем администратора
            User adminUser = new User();
            adminUser.setName("Admin");
            adminUser.setSureName("Adminov");
            adminUser.setUsername("admin");
            adminUser.setPassword("admin"); // Пароль будет зашифрован в UserServiceImp
            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(adminRoleFromDb);
            adminUser.setRoles(adminRoles);
            userService.save(adminUser);

            // Создаем обычного пользователя
            User regularUser = new User();
            regularUser.setName("User");
            regularUser.setSureName("Userov");
            regularUser.setUsername("user");
            regularUser.setPassword("user"); // Пароль будет зашифрован в UserServiceImp
            Set<Role> userRoles = new HashSet<>();
            userRoles.add(userRoleFromDb);
            regularUser.setRoles(userRoles);
            userService.save(regularUser);

            System.out.println("Data initialization completed!");
        } else {
            System.out.println("Data already initialized. Skipping...");
        }
    }
}