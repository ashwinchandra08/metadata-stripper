package com.metadatastripper.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to handle client-side routing for React SPA.
 * Forwards all non-API routes to index.html so React Router can handle them.
 */
@Controller
public class SpaController {

    /**
     * Catch all GET requests that don't match API endpoints or static resources
     * and forward them to index.html for client-side routing.
     * 
     * The regex pattern [^\\.]* matches any path that doesn't contain a dot,
     * which effectively excludes static files like .js, .css, .png, etc.
     */
    @GetMapping(value = {"/{path:[^\\.]*}", "/{path:[^\\.]*}/**"})
    public String forward() {
        return "forward:/index.html";
    }
}
