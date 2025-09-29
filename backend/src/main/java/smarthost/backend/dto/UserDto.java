package smarthost.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import smarthost.backend.enums.UserTypes;

public class UserDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private UserTypes role;
    private String phone;


    public UserDto(Long id, String firstName, String lastName, String email, UserTypes role, String phone) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.role = role;
        this.phone = phone;
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
}
