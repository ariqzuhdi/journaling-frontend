export const fetchWithAuth = async (
    url: string,
    options: RequestInit = {}
) => {
    const token = localStorage.getItem("token");

    const res = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || "Request failed");
    }

    return res.json();
};
