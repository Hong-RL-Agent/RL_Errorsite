package com.biopay.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {
    @RequestMapping(value = {"/", "/dashboard", "/inventory", "/updates"})
    public String index() {
        return "forward:/index.html";
    }
}
