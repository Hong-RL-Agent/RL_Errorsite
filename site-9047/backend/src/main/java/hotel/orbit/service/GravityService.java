package hotel.orbit.service;

import org.springframework.stereotype.Service;

@Service
public class GravityService {
    public double correction(double input) {
        return recursiveCorrection(input);
    }

    private double recursiveCorrection(double value) {
        // J.A.W.S intentional defect #3:
        // Negative values move farther from zero, so the base case is never reached.
        if (value == 0) {
            return 0;
        }
        if (value < 0) {
            return recursiveCorrection(value - 1);
        }
        return 0.42 + recursiveCorrection(value - 1);
    }
}
