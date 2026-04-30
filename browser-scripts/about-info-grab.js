const COMPANY_NAME_SELECTOR = "h1.org-top-card-summary__title";

(() => {
  const getValueAfterLabel = (label) => {
    const matches = [...document.querySelectorAll("*")].filter(
      (el) => el.innerText?.trim() === label,
    );

    const outermost = matches.find(
      (el) => !matches.some((other) => other !== el && other.contains(el)),
    );

    const nextElement =
      outermost?.parentElement?.children[
        [...outermost.parentElement.children].indexOf(outermost) + 1
      ];

    return (
      nextElement?.querySelector("span")?.innerText?.trim() ||
      nextElement?.innerText?.trim() ||
      ""
    );
  };

  const compactObject = (value) => {
    if (Array.isArray(value)) {
      return value.map(compactObject).filter((item) => {
        if (item == null) return false;
        if (Array.isArray(item)) return item.length > 0;
        if (typeof item === "object") return Object.keys(item).length > 0;
        return item !== "";
      });
    }

    if (!value || typeof value !== "object") return value;

    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, compactObject(item)])
        .filter(([, item]) => {
          if (item == null) return false;
          if (Array.isArray(item)) return item.length > 0;
          if (typeof item === "object") return Object.keys(item).length > 0;
          return item !== "";
        }),
    );
  };

  const downloadJson = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `linkedin-company-about-snapshot-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const getCompanyName = () => {
    // Handles desktop and mobile selectors for company name

    return document.querySelector("h1.org-top-card-summary__title")
      ? document.querySelector("h1.org-top-card-summary__title")
      : document.querySelector("h1.top-card-layout__title");
  };

  const result = compactObject({
    sourceUrl: location.href,
    companyName: getCompanyName() ? getCompanyName().innerText.trim() : null,
    website: getValueAfterLabel("Website"),
    phone: getValueAfterLabel("Phone"),
    location: getValueAfterLabel("Headquarters"),
  });

  console.log(result);
  //downloadJson(result);
})();
