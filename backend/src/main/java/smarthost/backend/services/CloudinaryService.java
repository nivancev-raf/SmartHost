package smarthost.backend.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {

        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);

        this.cloudinary = new Cloudinary(config);
    }

    public String uploadImage(MultipartFile file, Long apartmentId, int imageIndex) throws IOException {
        Map<String, Object> uploadParams = new HashMap<>();

        // Organize images in folders by apartment ID
        uploadParams.put("folder", "smarthost/apartments/" + apartmentId);

        // Generate a meaningful public ID
        String publicId = "apartment_" + apartmentId + "_image_" + imageIndex;
        uploadParams.put("public_id", publicId);

        // Image transformations (optional)
//        uploadParams.put("transformation", ObjectUtils.asMap(
//                "width", 1200,
//                "height", 800,
//                "crop", "fill",
//                "quality", "auto"
//        ));

        // Upload to Cloudinary
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), uploadParams);

        // Return the secure URL
        return result.get("secure_url").toString();
    }

    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}