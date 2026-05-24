(function () {
  if (window.__PAGES_MOCK_API_INSTALLED__) return;
  window.__PAGES_MOCK_API_INSTALLED__ = true;

  const originalFetch = window.fetch ? window.fetch.bind(window) : null;

  function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {
      status: status || 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  function textOfBody(init) {
    if (!init || typeof init.body !== "string") return null;
    try { return JSON.parse(init.body); } catch (_) { return init.body; }
  }

  function makeItems(path) {
    const now = new Date().toISOString();
    return [1, 2, 3, 4].map(function (n) {
      return {
        id: n,
        name: "Mock item " + n,
        title: "Sample " + n,
        status: n % 2 ? "active" : "pending",
        type: path.split("/").filter(Boolean).pop() || "item",
        message: "GitHub Pages mock data",
        count: 10 * n,
        value: 100 * n,
        score: 70 + n,
        createdAt: now,
        updatedAt: now
      };
    });
  }

  function mockBody(url, init) {
    const method = ((init && init.method) || "GET").toUpperCase();
    const path = url.pathname.toLowerCase();
    const submitted = textOfBody(init);

    if (method !== "GET" && method !== "HEAD") {
      return {
        success: true,
        ok: true,
        id: "mock-id",
        message: "Mock API response for GitHub Pages",
        data: submitted || {}
      };
    }

    if (path.includes("health")) {
      return { ok: true, status: "healthy", service: "pages-mock-api" };
    }

    if (path.includes("summary") || path.includes("stats") || path.includes("analytics") || path.includes("dashboard")) {
      return {
        success: true,
        total: 128,
        count: 24,
        active: 18,
        pending: 4,
        failed: 2,
        revenue: 125000,
        users: 42,
        items: makeItems(path),
        data: makeItems(path),
        trend: [12, 18, 15, 22, 28, 31],
        updatedAt: new Date().toISOString()
      };
    }

    if (path.includes("status") || path.includes("profile") || path.includes("state") || path.includes("detail") || path.includes("current") || path.includes("result") || path.includes("session")) {
      return {
        success: true,
        ok: true,
        id: 1,
        name: "Mock User",
        status: "active",
        role: "admin",
        message: "Mock API response for GitHub Pages",
        data: makeItems(path)[0]
      };
    }

    if (path.includes("weather")) {
      return {
        success: true,
        location: "Seoul",
        temperature: 22,
        condition: "Clear",
        humidity: 45,
        forecast: makeItems(path)
      };
    }

    const items = makeItems(path);
    items.success = true;
    items.data = items;
    items.items = items;
    items.results = items;
    items.total = items.length;
    return items;
  }

  window.fetch = function (input, init) {
    const rawUrl = typeof input === "string" ? input : input && input.url;
    if (!rawUrl) {
      return originalFetch ? originalFetch(input, init) : Promise.reject(new Error("fetch unavailable"));
    }

    const url = new URL(rawUrl, window.location.href);
    if (url.pathname.includes("/api/")) {
      return Promise.resolve(jsonResponse(mockBody(url, init)));
    }

    return originalFetch ? originalFetch(input, init) : Promise.reject(new Error("fetch unavailable"));
  };
})();
