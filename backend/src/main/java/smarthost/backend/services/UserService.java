package smarthost.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import smarthost.backend.dto.UserDTO;
import smarthost.backend.model.User;
import smarthost.backend.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User myUser = this.userRepository.findByEmail(email);
        if(myUser == null) {
            throw new UsernameNotFoundException("User with email  "+email+" not found");
        }

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + myUser.getRole().name()));

//        System.out.println("permissions1: " + permissions);
        return org.springframework.security.core.userdetails.User.withUsername(myUser.getEmail())
                .password(myUser.getPassword())
                .authorities(authorities)
                .build();

    }

    public UserDTO getUserDTOByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
        return new UserDTO(user.getId(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getRole(), user.getPhone());
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }




}
