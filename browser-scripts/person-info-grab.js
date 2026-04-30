const nameSelectors = {
  desktop:
    'document.querySelector("div:nth-of-type(1) > div:nth-of-type(1) > div > a > div > div > h2")',
};

const locationSelectors = {
  desktop:
    'document.querySelector("div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div > div:nth-of-type(2) > p:nth-of-type(1)")',
};

const emailSelectors = {
  all: `document.querySelector('a[href^="mailto:"]')`,
};

const linkedInSelectors = {
  all: `document.querySelector('a[href^="https://www.linkedin.com/in/"]')`,
};

const phoneSelectors = {
  desktop: `const path = document.querySelector(
  'path[d="m14.71 13.15-1.27 1.27c-.57.57-1.44.74-2.19.43-2.36-.94-4.41-2.28-6.11-3.98S2.1 7.12 1.16 4.76c-.3-.75-.14-1.62.44-2.19l1.28-1.28a.996.996 0 0 1 1.41 0l1.82 1.82c.39.39.39 1.03 0 1.41L4.96 5.67c1.3 2.27 3.11 4.08 5.39 5.38l1.14-1.14a.996.996 0 0 1 1.41 0l1.82 1.82c.39.39.39 1.02 0 1.41z"]'
);

const svg = path?.closest("svg");
const parent = svg?.parentElement;
const svgChildIndex = [...parent.children].indexOf(svg);

const nextDiv = [...parent.children]
  .slice(svgChildIndex + 1)
  .find((el) => el.matches("div"));

const targetSpan = nextDiv?.querySelector("p:nth-of-type(2) span:nth-of-type(1)");

console.log(targetSpan?.innerText.trim());`,
};

const titleSelectors = {
  all: `"section > div > div:nth-of-type(2) > :nth-child(2) p:nth-of-type(1)"`,
};
