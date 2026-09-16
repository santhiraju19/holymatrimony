package com.theholymatrimony.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
        properties = {
                "jwt.secret=HolyMatrimonyAutomatedTestJwtSecret2026OnlyForTests12345678901234567890"
        }
)
class BackendApplicationTests {

    @Test
    void contextLoads() {
    }
}
