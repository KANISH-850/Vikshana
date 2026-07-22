/**
 * Catalyst SDK Service
 */

export const ensureCatalystLoaded = async () => {
  if (typeof window !== 'undefined' && window.catalyst) {
    return window.catalyst;
  }
  
  return new Promise((resolve, reject) => {
    // If window.catalyst is missing, dynamically load the main SDK first, then init.js
    const loadInit = () => {
      const initScript = document.createElement('script');
      initScript.src = '/__catalyst/sdk/init.js';
      initScript.onload = () => {
        if (window.catalyst) resolve(window.catalyst);
        else reject(new Error("SDK loaded but window.catalyst is still undefined"));
      };
      initScript.onerror = () => reject(new Error("Failed to load init.js"));
      document.head.appendChild(initScript);
    };

    if (typeof window.catalyst === 'undefined') {
      const mainScript = document.createElement('script');
      mainScript.src = 'https://static.zohocdn.com/catalyst/sdk/js/4.0.0/catalystWebSDK.js';
      mainScript.onload = loadInit;
      mainScript.onerror = () => reject(new Error("Failed to load catalystWebSDK.js"));
      document.head.appendChild(mainScript);
    } else {
      loadInit();
    }
  });
};

export const getCatalyst = () => {
  if (typeof window !== 'undefined' && window.catalyst) {
    return window.catalyst;
  }
  return null;
};

// Default export uses a Proxy so `catalyst.auth` dynamically fetches the latest window.catalyst
const catalystProxy = new Proxy({}, {
  get: function(target, prop) {
    if (typeof window !== 'undefined' && window.catalyst) {
      return window.catalyst[prop];
    }
    throw new Error("Catalyst SDK not found. Make sure init.js is loaded.");
  }
});

export const catalyst = catalystProxy;
export default catalystProxy;
