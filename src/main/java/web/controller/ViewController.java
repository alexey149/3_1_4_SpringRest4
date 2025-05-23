package web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/user")
    public String showUserInfo() {
        return "user/userInfo";
    }

    @GetMapping("/admin")
    public String showAdminPanel() {
        return "admin/users";
    }
}