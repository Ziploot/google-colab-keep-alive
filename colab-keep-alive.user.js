// ==UserScript==
// @name         ZipLoot Google Colab Keep-Alive Bypass
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Bypasses Google Colab 90-minute Idle Timeout and keeps notebooks active.
// @author       ZipLoot
// @match        https://colab.research.google.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    console.log("[ZipLoot] Google Colab Keep-Alive Script Activated!");

    function clickConnectButton() {
        // Find Google Colab's custom connect element
        const connectBtn = document.querySelector("colab-connect-button");
        if (connectBtn) {
            // Locate the button inside the shadow DOM
            const innerBtn = connectBtn.shadowRoot ? connectBtn.shadowRoot.querySelector("#connect") : null;
            if (innerBtn) {
                // If disconnected, click it
                if (innerBtn.textContent.includes("Reconnect") || innerBtn.textContent.includes("Connect")) {
                    innerBtn.click();
                    console.log("[ZipLoot] Connected/Reconnected to Colab Runtime.");
                }
            }
        }
        
        // Handle dialog prompts asking if you are still there
        const okButtons = document.querySelectorAll("paper-button#ok, paper-button[id='ok']");
        okButtons.forEach(btn => {
            if (btn.textContent.includes("Yes") || btn.textContent.includes("Re-connect") || btn.textContent.includes("OK")) {
                btn.click();
                console.log("[ZipLoot] Dismissed active disconnect popup dialog.");
            }
        });
    }

    function simulateUserScroll() {
        // Select vertical scroll container
        const scroller = document.querySelector(".notebook-vertical-scroller");
        if (scroller) {
            // Scroll down 10px and scroll back up after 200ms
            scroller.scrollTop += 10;
            setTimeout(() => {
                scroller.scrollTop -= 10;
            }, 200);
            console.log("[ZipLoot] Simulated scroll movement to bypass idle timeout.");
        }
    }

    function keepAliveLoop() {
        try {
            clickConnectButton();
            simulateUserScroll();
        } catch (e) {
            console.error("[ZipLoot] Keep-alive error: ", e);
        }
    }

    // Run keepAliveLoop every 60 seconds
    setInterval(keepAliveLoop, 60000);
})();
