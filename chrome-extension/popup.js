const companyCaptureButton = document.querySelector("#capture-company-button");
const personCaptureButton = document.querySelector("#capture-person-button");
const statusElement = document.querySelector("#status");
const captureOutput = document.querySelector("#capture-output");
let clearCaptureTimer;

const setStatus = (message) => {
  statusElement.textContent = message;
};

const setButtonsDisabled = (disabled) => {
  companyCaptureButton.disabled = disabled;
  personCaptureButton.disabled = disabled;
};

const clearCaptureDisplay = () => {
  setStatus("");
  captureOutput.textContent = "";
  captureOutput.hidden = true;
};

const showCaptureDisplay = (snapshot) => {
  window.clearTimeout(clearCaptureTimer);
  captureOutput.textContent = JSON.stringify(snapshot, null, 2);
  captureOutput.hidden = false;
  clearCaptureTimer = window.setTimeout(clearCaptureDisplay, 3000);
};

const getActiveTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};

const reloadTabAndWait = (tabId) =>
  new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(handleUpdated);
      reject(new Error("Timed out while refreshing the LinkedIn page."));
    }, 30000);

    const handleUpdated = (updatedTabId, changeInfo) => {
      if (updatedTabId !== tabId || changeInfo.status !== "complete") {
        return;
      }

      window.clearTimeout(timeoutId);
      chrome.tabs.onUpdated.removeListener(handleUpdated);
      resolve();
    };

    chrome.tabs.onUpdated.addListener(handleUpdated);
    chrome.tabs.reload(tabId);
  });

const toTimestamp = () => new Date().toISOString().replace(/[:.]/g, "-");

const toCamelFilenamePart = (value) => {
  const words = String(value || "")
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

const toDownloadFilename = (snapshot, snapshotType) => {
  if (snapshotType === "company") {
    const companyName = toCamelFilenamePart(snapshot?.companyName) || "Company";
    return `${companyName}-${toTimestamp()}.json`;
  }

  return `linkedin-${snapshotType}-snapshot-${toTimestamp()}.json`;
};

const downloadSnapshot = async (snapshot, snapshotType) => {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  try {
    await chrome.downloads.download({
      url,
      filename: toDownloadFilename(snapshot, snapshotType),
      saveAs: false,
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};

async function captureLinkedInCompanySnapshot() {
  const normalizeText = (value) =>
    (value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const compactObject = (value) =>
    Object.fromEntries(
      Object.entries(value).filter(([, item]) => item != null && item !== ""),
    );

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const getCompanyNameElement = () =>
    document.querySelector("h1.org-top-card-summary__title") ||
    document.querySelector("h1.top-card-layout__title");

  const getCompanyName = () => normalizeText(getCompanyNameElement()?.innerText);

  const getLabelElement = (label) => {
    const matches = [...document.querySelectorAll("*")].filter(
      (element) => normalizeText(element.innerText) === label,
    );

    return matches.find(
      (element) =>
        !matches.some((other) => other !== element && other.contains(element)),
    );
  };

  const hasAboutDetails = () =>
    ["Website", "Headquarters", "Phone", "Industry", "Company size"].some(
      (label) => Boolean(getLabelElement(label)),
    );

  const waitForCompanyData = async () => {
    const deadline = Date.now() + 15000;

    while (Date.now() < deadline) {
      if (getCompanyName() && hasAboutDetails()) {
        return;
      }

      await sleep(250);
    }

    throw new Error("Timed out waiting for LinkedIn company data.");
  };

  const getValueAfterLabel = (label) => {
    const labelElement = getLabelElement(label);

    if (!labelElement?.parentElement) return "";

    const termElement = labelElement.closest("dt");
    const valueElement =
      termElement?.nextElementSibling?.matches("dd")
        ? termElement.nextElementSibling
        : [...labelElement.parentElement.children][
            [...labelElement.parentElement.children].indexOf(labelElement) + 1
          ];

    if (!valueElement) return "";

    if (label === "Website") {
      const websiteLink = valueElement.querySelector("a[href]");
      return normalizeText(
        websiteLink?.href ||
          websiteLink?.innerText ||
          valueElement.querySelector("span, dd")?.innerText ||
          valueElement.innerText,
      );
    }

    return normalizeText(
      valueElement.querySelector("span, dd")?.innerText ||
        valueElement.innerText,
    );
  };

  await waitForCompanyData();

  return compactObject({
    sourceUrl: location.href,
    companyName: getCompanyName(),
    website: getValueAfterLabel("Website"),
    phone: getValueAfterLabel("Phone"),
    location: getValueAfterLabel("Headquarters"),
  });
}

function captureLinkedInPersonSnapshot() {
  const PHONE_ICON_PATH =
    'm14.71 13.15-1.27 1.27c-.57.57-1.44.74-2.19.43-2.36-.94-4.41-2.28-6.11-3.98S2.1 7.12 1.16 4.76c-.3-.75-.14-1.62.44-2.19l1.28-1.28a.996.996 0 0 1 1.41 0l1.82 1.82c.39.39.39 1.03 0 1.41L4.96 5.67c1.3 2.27 3.11 4.08 5.39 5.38l1.14-1.14a.996.996 0 0 1 1.41 0l1.82 1.82c.39.39.39 1.02 0 1.41z';

  const normalizeText = (value) =>
    (value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const compactObject = (value) =>
    Object.fromEntries(
      Object.entries(value).filter(([, item]) => item != null && item !== ""),
    );

  const isMobileMode = () => {
    const userAgent = navigator.userAgent || "";
    const hasMobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(
      userAgent,
    );
    const hasMobileClientHint = navigator.userAgentData?.mobile === true;
    const hasSmallViewport = window.innerWidth < 768;

    return hasMobileClientHint || hasMobileUserAgent || hasSmallViewport;
  };

  const showNotification = (message) => {
    console.warn(message);

    const existingNotification = document.querySelector(
      "[data-get-person-info-notification]",
    );
    existingNotification?.remove();

    const notification = document.createElement("div");
    notification.dataset.getPersonInfoNotification = "true";
    notification.textContent = message;
    Object.assign(notification.style, {
      position: "fixed",
      zIndex: "2147483647",
      top: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      maxWidth: "calc(100vw - 32px)",
      borderRadius: "8px",
      padding: "12px 14px",
      color: "#ffffff",
      background: "#0a66c2",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
      font: '14px/1.35 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      textAlign: "center",
    });

    document.body.append(notification);
    window.setTimeout(() => notification.remove(), 5000);
  };

  const abort = (message) => {
    showNotification(message);
    throw new Error(message);
  };

  const isContactInfoOverlay = () =>
    window.location.pathname.endsWith("/overlay/contact-info/");

  const getName = () =>
    normalizeText(
      document.querySelector(
        "div:nth-of-type(1) > div:nth-of-type(1) > div > a > div > div > h2",
      )?.innerText,
    );

  const getLocation = () =>
    normalizeText(
      document.querySelector(
        "div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div > div:nth-of-type(2) > p:nth-of-type(1)",
      )?.innerText,
    );

  const getTitle = () =>
    normalizeText(
      [
        "div:nth-of-type(1) > ul > li:nth-of-type(1) > div:nth-of-type(2) > a > div > p:nth-of-type(1)",
        "section > div > div:nth-of-type(2) > :nth-child(2) p:nth-of-type(1)",
      ]
        .map((selector) => document.querySelector(selector))
        .find(Boolean)?.innerText,
    );

  const getEmail = () => {
    const href = document.querySelector('a[href^="mailto:"]')?.href || "";
    return normalizeText(href.replace(/^mailto:/i, ""));
  };

  const getLinkedIn = () =>
    document.querySelector('a[href^="https://www.linkedin.com/in/"]')?.href ||
    "";

  const getPhone = () => {
    const path = document.querySelector(`path[d="${PHONE_ICON_PATH}"]`);
    const svg = path?.closest("svg");
    const parent = svg?.parentElement;
    if (!parent) return "";

    const svgChildIndex = [...parent.children].indexOf(svg);
    const nextDiv = [...parent.children]
      .slice(svgChildIndex + 1)
      .find((element) => element.matches("div"));

    return normalizeText(
      nextDiv?.querySelector("p:nth-of-type(2) span:nth-of-type(1)")
        ?.innerText,
    );
  };

  if (isMobileMode()) {
    abort("Switch to desktop mode to capture person JSON.");
  }

  if (!isContactInfoOverlay()) {
    abort('Go to a URL that ends in "/overlay/contact-info/" to capture person JSON.');
  }

  return compactObject({
    name: getName(),
    title: getTitle(),
    location: getLocation(),
    email: getEmail(),
    linkedIn: getLinkedIn(),
    phone: getPhone(),
  });
}

const captureSnapshot = async ({
  button,
  snapshotType,
  captureFunction,
  reloadBeforeCapture = false,
  world = "MAIN",
}) => {
  setButtonsDisabled(true);
  setStatus("Capturing...");

  try {
    const tab = await getActiveTab();

    if (!tab?.id || !tab.url?.startsWith("https://www.linkedin.com/")) {
      throw new Error("Open a LinkedIn page first.");
    }

    if (reloadBeforeCapture) {
      setStatus("Refreshing...");
      await reloadTabAndWait(tab.id);
      setStatus("Capturing...");
    }

    const [injectionResult] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world,
      func: captureFunction,
    });

    const snapshot = injectionResult?.result;
    if (!snapshot || typeof snapshot !== "object") {
      throw new Error(`No ${snapshotType} data was captured.`);
    }

    await downloadSnapshot(snapshot, snapshotType);
    showCaptureDisplay(snapshot);
    setStatus("Downloaded JSON.");
  } catch (error) {
    window.clearTimeout(clearCaptureTimer);
    captureOutput.textContent = "";
    captureOutput.hidden = true;
    setStatus(error.message || "Capture failed.");
  } finally {
    button.focus();
    setButtonsDisabled(false);
  }
};

companyCaptureButton.addEventListener("click", () => {
  captureSnapshot({
    button: companyCaptureButton,
    snapshotType: "company",
    captureFunction: captureLinkedInCompanySnapshot,
    reloadBeforeCapture: true,
  });
});

personCaptureButton.addEventListener("click", () => {
  captureSnapshot({
    button: personCaptureButton,
    snapshotType: "person",
    captureFunction: captureLinkedInPersonSnapshot,
  });
});
