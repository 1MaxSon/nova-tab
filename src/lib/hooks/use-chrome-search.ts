export const useChromeSearch = () => {
	const search =(query: string) => {
		if (!query.trim()) return;
		if (typeof chrome !== "undefined" && chrome.search?.query)
			chrome.search.query({ text: query, disposition: "CURRENT_TAB" });
		else
			window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
	};

    return { search }
};
