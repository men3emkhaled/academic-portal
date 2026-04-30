export const safeGetItem = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`localStorage blocked for getItem: ${key}`);
    return null;
  }
};

export const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage blocked for setItem: ${key}`);
  }
};

export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`localStorage blocked for removeItem: ${key}`);
  }
};
