package com.zenith.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String location;
    private Integer price;
    private String imageUrl;
    @Column(length = 1000)
    private String description;
    
    @ElementCollection
    private List<String> galleryImages;

    public Property() {}

    public Property(String name, String location, Integer price, String imageUrl, String description, List<String> galleryImages) {
        this.name = name;
        this.location = location;
        this.price = price;
        this.imageUrl = imageUrl;
        this.description = description;
        this.galleryImages = galleryImages;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getLocation() { return location; }
    public Integer getPrice() { return price; }
    public String getImageUrl() { return imageUrl; }
    public String getDescription() { return description; }
    public List<String> getGalleryImages() { return galleryImages; }
}
