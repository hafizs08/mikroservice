package com.example.review.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "recommendations")
public class Recommendation {
    @Id
    private String id;
    private String userId;
    private List<String> bookIds;

    public void setBookIds(List<String> bookIds) {
        this.bookIds = bookIds;
    }
}