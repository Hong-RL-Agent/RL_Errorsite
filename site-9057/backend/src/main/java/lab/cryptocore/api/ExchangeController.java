package lab.cryptocore.api;

import jakarta.validation.Valid;
import lab.cryptocore.engine.ExchangeEngineService;
import lab.cryptocore.model.EngineSnapshot;
import lab.cryptocore.model.OrderRequest;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exchange")
@CrossOrigin(origins = "*")
public class ExchangeController {
    private final ExchangeEngineService exchangeEngineService;

    public ExchangeController(ExchangeEngineService exchangeEngineService) {
        this.exchangeEngineService = exchangeEngineService;
    }

    @GetMapping("/snapshot")
    public EngineSnapshot snapshot() {
        return exchangeEngineService.snapshot();
    }

    @PostMapping("/orders")
    public EngineSnapshot submitOrder(@Valid @RequestBody OrderRequest request) {
        return exchangeEngineService.processOrder(request);
    }
}

