package com.agenticomics.datamanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties
public class DataManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(DataManagementApplication.class, args);
    }
}