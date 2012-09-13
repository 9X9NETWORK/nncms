package com.nncloudtv.nncms.web;

import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class CmsController {
	
	protected static final Logger log = Logger.getLogger(CmsController.class.getName());
	
	@RequestMapping("/{html}.html")
	public String html(HttpServletRequest req, HttpServletResponse resp, @PathVariable String html) {
	    
	    log.info(html);
	    
	    return html;
	}
	
}
