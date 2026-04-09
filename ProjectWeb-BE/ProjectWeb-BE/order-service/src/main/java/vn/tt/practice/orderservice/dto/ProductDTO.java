package vn.tt.practice.orderservice.dto;

import lombok.Data;

@Data
public class ProductDTO {
    private String id;
    private String name;
    private double price;
    private String description;
    private String image;
    private boolean checkToCart;
    private Integer rating;
    private Integer quantity;
    private String productCode;
}
