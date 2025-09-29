package smarthost.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import smarthost.backend.enums.UserTypes;

import java.time.LocalDateTime;

public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private UserTypes role;
    private String phone;
    private LocalDateTime created_at;


    public UserDto(Long id, String firstName, String lastName, String email, UserTypes role, String phone, LocalDateTime created_at) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.phone = phone;
        this.created_at = created_at;
    }

    @JsonProperty
    public Long getId() {
        return id;
    }
    @JsonProperty
    public String getFirstName() {
        return firstName;
    }
    @JsonProperty
    public String getLastName() {
        return lastName;
    }
    @JsonProperty
    public String getEmail() {
        return email;
    }
    @JsonProperty
    public UserTypes getRole() {
        return role;
    }
    @JsonProperty
    public String getPhone() {
        return phone;
    }
    @JsonProperty
    public LocalDateTime getCreated_at() {
        return created_at;
    }
}
