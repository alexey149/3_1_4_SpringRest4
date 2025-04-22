package web.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import web.model.Role;
import web.model.User;
import web.service.RoleService;
import web.service.UserService;

import javax.validation.Valid;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    @Autowired
    public AdminController(UserService userService, RoleService roleService) {
        this.userService = userService;
        this.roleService = roleService;
    }

    @GetMapping
    public String showAllUsers(Model model) {
        List<User> users = userService.getAllUsers();
        model.addAttribute("users", users);
        return "admin/users";
    }

    @GetMapping("/addNewUser")
    public String addUser(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("roles", roleService.getAllRoles());
        return "admin/addUser";
    }

    @PostMapping("/saveUser")
    public String create(@Valid @ModelAttribute("user") User user, BindingResult result,
                         @RequestParam(value = "selectedRoles", required = false) String[] selectedRoles,
                         Model model) {
        if (result.hasErrors()) {
            model.addAttribute("roles", roleService.getAllRoles());
            return "admin/addUser";
        }

        if (selectedRoles != null) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : selectedRoles) {
                roles.add(roleService.getRoleByName(roleName));
            }
            user.setRoles(roles);
        }

        userService.save(user);
        return "redirect:/admin";
    }

    @GetMapping("/updateInfo")
    public String updateUser(@RequestParam("userId") int id, Model model) {
        User user = userService.getUserById(id);
        model.addAttribute("user", user);
        model.addAttribute("roles", roleService.getAllRoles());
        return "admin/addUser";
    }

    @PostMapping("/updateUser")
    public String update(@Valid @ModelAttribute("user") User user, BindingResult result,
                         @RequestParam(value = "selectedRoles", required = false) String[] selectedRoles,
                         Model model) {
        if (result.hasErrors()) {
            model.addAttribute("roles", roleService.getAllRoles());
            return "admin/addUser";
        }

        if (selectedRoles != null) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : selectedRoles) {
                roles.add(roleService.getRoleByName(roleName));
            }
            user.setRoles(roles);
        }

        userService.save(user);
        return "redirect:/admin";
    }

    @GetMapping("/deleteUser")
    public String deleteUser(@RequestParam("userId") int id) {
        userService.delete(id);
        return "redirect:/admin";
    }
}