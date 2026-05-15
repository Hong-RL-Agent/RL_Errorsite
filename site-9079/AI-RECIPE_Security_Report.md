# AI-RECIPE Security Training Report

Port isolation: all public traffic is scoped to `http://localhost:9079`.

This report describes inert PPO-training simulations. The project intentionally avoids real exploit execution, command execution, persistence, credential capture, or memory unsafe native code.

## Simulated Patterns

1. Social engineering message simulation
   - A training-only alert models how an operator could be pressured into sharing administrative approval.
   - Detection signal: urgent language, authority spoofing, credential request framing.

2. Backdoor route simulation
   - The `/api/security/backdoor-probe` endpoint returns a denied training event instead of opening control.
   - Detection signal: hidden route access, suspicious trigger phrase, privilege-escalation intent.

3. Memory corruption parser simulation
   - The memory engine flags malformed recipe token streams that would corrupt bounds metadata in unsafe systems.
   - Detection signal: invalid length prefix, delimiter skew, corrupted parse state.

4. Race condition file-handling simulation
   - The simulator models a time-of-check/time-of-use mismatch for a recipe import file.
   - Detection signal: file fingerprint changes between validation and commit phases.

5. Type confusion scenario
   - Ingredient objects are intentionally classified against mismatched schemas in the simulator.
   - Detection signal: object tag and payload shape disagreement.

6. Integer overflow simulation
   - Large batch-size multiplication is checked against 32-bit signed integer boundaries.
   - Detection signal: wrapped serving count or negative computed allocation.

7. Buffer overflow simulation
   - A fixed virtual buffer accepts oversize recipe names and emits a blocked overflow event.
   - Detection signal: input length exceeds the virtual stack buffer capacity.

8. Use-after-free simulation
   - The memory engine frees a virtual recipe node and then records an attempted read.
   - Detection signal: dereference against a released object id.

9. Format string simulation
   - User-provided formatting tokens are reported as unsafe when treated as a log template.
   - Detection signal: unexpected `%` or indexed formatter tokens in operator-controlled text.

10. Heap spray simulation
    - The simulator fills virtual heap pages with repeated marker patterns without allocating hostile real memory.
    - Detection signal: repeated sled-like pattern density across virtual heap segments.

11. ROP scenario simulation
    - The simulator links named benign gadget labels to demonstrate control-flow anomaly detection.
    - Detection signal: return chain shape, gadget density, nonstandard transition graph.

## Defensive Controls In The Project

- Spring Boot global CORS is limited to `http://localhost:9079` by default.
- Frontend API requests use relative `/api/...` paths only.
- Vite development proxy routes `/api` to the backend service.
- Docker Compose exposes only frontend port `9079` to the host.
- Security endpoints return structured training telemetry, not executable exploit behavior.

