package com.example.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;

    public ApiResponse(String status, String message) {
        this.status = status;
        this.message = message;
        this.data = null;
    }
}
