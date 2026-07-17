// ==UserScript==
// @name         ZipLoot Google Colab Keep-Alive Bypass
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Bypasses Google Colab 90-minute Idle Timeout with an interactive floating control panel.
// @author       ZipLoot
// @match        https://colab.research.google.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 1. Inject Styles for the Floating Dashboard
    const style = document.createElement("style");
    style.textContent = `
        #colab-keepalive-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 16px;
            width: 250px;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
        }
        #colab-keepalive-panel.minimized {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            padding: 0;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        .ka-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 8px;
        }
        .ka-title {
            font-weight: 700;
            font-size: 13px;
            letter-spacing: 0.5px;
            background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .ka-toggle-minimize {
            cursor: pointer;
            opacity: 0.6;
            font-size: 14px;
            background: none;
            border: none;
            color: white;
        }
        .ka-toggle-minimize:hover {
            opacity: 1;
        }
        .ka-stat {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            font-size: 11px;
            color: #94a3b8;
        }
        .ka-val {
            font-weight: 600;
            color: #f1f5f9;
        }
        .ka-status {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .ka-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
        }
        .ka-dot.inactive {
            background: #ef4444;
            box-shadow: 0 0 8px #ef4444;
        }
        .ka-btn {
            width: 100%;
            background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
            color: white;
            border: none;
            padding: 8px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 11px;
            cursor: pointer;
            margin-top: 8px;
            transition: opacity 0.2s;
        }
        .ka-btn:hover {
            opacity: 0.9;
        }
        .ka-min-icon {
            display: none;
            font-size: 20px;
            color: #06b6d4;
        }
        #colab-keepalive-panel.minimized .ka-min-icon {
            display: block;
        }
        #colab-keepalive-panel.minimized > *:not(.ka-min-icon) {
            display: none;
        }
    `;
    document.head.appendChild(style);

    // 2. State Variables
    let isRunning = true;
    let clickCount = 0;
    let startTime = Date.now();
    let lastActionTime = "None";

    // 3. Create Dashboard UI
    const panel = document.createElement("div");
    panel.id = "colab-keepalive-panel";
    
    panel.innerHTML = `
        <div class="ka-min-icon">⚡</div>
        <div class="ka-header">
            <span class="ka-title">ZIPLOOT BYPASS</span>
            <button class="ka-toggle-minimize" id="ka-min-btn">−</button>
        </div>
        <div class="ka-stat">
            <span>Status:</span>
            <div class="ka-status">
                <div class="ka-dot" id="ka-status-dot"></div>
                <span class="ka-val" id="ka-status-text">Active</span>
            </div>
        </div>
        <div class="ka-stat">
            <span>Time Elapsed:</span>
            <span class="ka-val" id="ka-time">00:00:00</span>
        </div>
        <div class="ka-stat">
            <span>Auto Clicks:</span>
            <span class="ka-val" id="ka-clicks">0</span>
        </div>
        <div class="ka-stat">
            <span>Last Simulation:</span>
            <span class="ka-val" id="ka-last-action">None</span>
        </div>
        <button class="ka-btn" id="ka-toggle-btn">Disable Keep-Alive</button>
    `;
    document.body.appendChild(panel);

    // 4. Minimize / Maximize Event Listeners
    const minBtn = panel.querySelector("#ka-min-btn");
    const minimizePanel = () => {
        panel.classList.toggle("minimized");
        if (panel.classList.contains("minimized")) {
            localStorage.setItem("colab-ka-minimized", "true");
        } else {
            localStorage.setItem("colab-ka-minimized", "false");
        }
    };
    minBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        minimizePanel();
    });
    panel.addEventListener("click", () => {
        if (panel.classList.contains("minimized")) {
            minimizePanel();
        }
    });

    // Restore minimized state
    if (localStorage.getItem("colab-ka-minimized") === "true") {
        panel.classList.add("minimized");
    }

    // Toggle Button Listener
    const toggleBtn = panel.querySelector("#ka-toggle-btn");
    const statusDot = panel.querySelector("#ka-status-dot");
    const statusText = panel.querySelector("#ka-status-text");

    toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        isRunning = !isRunning;
        if (isRunning) {
            statusDot.classList.remove("inactive");
            statusText.innerText = "Active";
            toggleBtn.innerText = "Disable Keep-Alive";
            toggleBtn.style.background = "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)";
            console.log("[ZipLoot] Google Colab Keep-Alive Activated.");
        } else {
            statusDot.classList.add("inactive");
            statusText.innerText = "Disabled";
            toggleBtn.innerText = "Enable Keep-Alive";
            toggleBtn.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
            console.log("[ZipLoot] Google Colab Keep-Alive Paused.");
        }
    });

    // 5. Timer Loop
    setInterval(() => {
        if (!isRunning) return;
        const diff = Date.now() - startTime;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        document.getElementById("ka-time").innerText = `${h}:${m}:${s}`;
    }, 1000);

    // 6. Action Functions
    function clickConnectButton() {
        // Look inside Colab Connect Button
        const connectBtn = document.querySelector("colab-connect-button");
        if (connectBtn) {
            const innerBtn = connectBtn.shadowRoot ? connectBtn.shadowRoot.querySelector("#connect") : null;
            if (innerBtn) {
                const text = innerBtn.textContent || "";
                if (text.includes("Reconnect") || text.includes("Connect")) {
                    innerBtn.click();
                    clickCount++;
                    document.getElementById("ka-clicks").innerText = clickCount;
                    lastActionTime = new Date().toLocaleTimeString();
                    document.getElementById("ka-last-action").innerText = lastActionTime;
                    console.log("[ZipLoot] Clicked Reconnect/Connect button inside shadowRoot.");
                }
            }
        }

        // Handle popup warning boxes (e.g. Yes/OK dialogs)
        const okButtons = document.querySelectorAll("paper-button#ok, paper-button[id='ok'], paper-button.keyboard-focus");
        okButtons.forEach(btn => {
            const text = btn.textContent || "";
            if (text.includes("Yes") || text.includes("Re-connect") || text.includes("OK")) {
                btn.click();
                clickCount++;
                document.getElementById("ka-clicks").innerText = clickCount;
                lastActionTime = new Date().toLocaleTimeString();
                document.getElementById("ka-last-action").innerText = lastActionTime;
                console.log("[ZipLoot] Dismissed warning popup dialog.");
            }
        });
    }

    function simulateUserScroll() {
        const scroller = document.querySelector(".notebook-vertical-scroller");
        if (scroller) {
            scroller.scrollTop += 15;
            setTimeout(() => {
                scroller.scrollTop -= 15;
            }, 350);
            
            lastActionTime = new Date().toLocaleTimeString();
            document.getElementById("ka-last-action").innerText = lastActionTime;
            console.log("[ZipLoot] Simulated scroll movement successfully.");
        }
    }

    const isTestLab = window.location.href.includes("test-lab.html");
    const intervalTime = isTestLab ? 2000 : 30000;

    // 7. Core Loop Execution
    setInterval(() => {
        if (!isRunning) return;
        try {
            clickConnectButton();
            simulateUserScroll();
        } catch (err) {
            console.error("[ZipLoot] Keepalive loop error:", err);
        }
    }, intervalTime);
})();
