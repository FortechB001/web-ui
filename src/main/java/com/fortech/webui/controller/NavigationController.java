package com.fortech.webui.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class NavigationController {

    @GetMapping(path = "/")
    public String main() {
        return "main.html";
    }

    @GetMapping(path = "/admin")
    public String admin() {
        return "administration.html";
    }
}
