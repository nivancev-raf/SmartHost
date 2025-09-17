package smarthost.backend.utils;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import smarthost.backend.enums.UserTypes;
import smarthost.backend.model.User;
import smarthost.backend.repository.UserRepository;

import java.util.Set;


@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {

        if (userRepository.findByEmail("admin@gmail.com") == null) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("Admin");
            admin.setEmail("admin@gmail.com");
            admin.setRole(UserTypes.ADMIN);
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setPhone("1234567890");
            userRepository.save(admin);
        }

        // make client
        if (userRepository.findByEmail("client@gmail.com") == null){
            User client = new User();
            client.setFirstName("Client");
            client.setLastName("Client");
            client.setEmail("client@gmail.com");
            client.setRole(UserTypes.CLIENT);
            client.setPassword(passwordEncoder.encode("client"));
            client.setPhone("0987654321");
            userRepository.save(client);
        }

    }
}
