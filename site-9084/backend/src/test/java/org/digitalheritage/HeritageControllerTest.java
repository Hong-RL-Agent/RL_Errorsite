package org.digitalheritage;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class HeritageControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void dashboardUses9084BaseUrl() throws Exception {
        mockMvc.perform(get("/api/heritage/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.baseUrl", is("http://localhost:9084")))
                .andExpect(jsonPath("$.institution", is("DIGITAL-HERITAGE")));
    }
}
