// ==UserScript==
// @name        Universal Audio Device Selector
// @namespace   Violentmonkey Scripts
// @match       *://*/*
// @grant       none
// @version     1.0
// @author      tiamed
// @homepageURL https://github.com/tiamed/universal-audio-device-selector
// @description Universal audio output device selector
// @run-at      document-end
// ==/UserScript==

(function() {
    'use strict';

    let devices = [];
    let currentDevice;
    const menu = document.createElement('div');
    let isMenuVisible = false;

    // 初始化样式
    Object.assign(menu.style, {
        position: 'fixed',
        bottom: '60px',
        right: '20px',
        background: '#333',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 999999,
        display: 'none',
        maxHeight: '60vh',
        overflowY: 'auto',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        minWidth: '200px'
    });

    async function initDevices() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            await updateDeviceList();
        } catch(e) {
            console.error('Device access error:', e);
        }
    }

    async function updateDeviceList() {
        devices = (await navigator.mediaDevices.enumerateDevices())
            .filter(d => d.kind === 'audiooutput' && d.deviceId !== 'default');

        const saved = localStorage.getItem('audioDevice');
        currentDevice = devices.find(d => d.deviceId === saved) || devices[0];
    }

    function createDeviceList() {
        menu.innerHTML = `
            <div style="margin-bottom:10px;font-weight:bold;padding:0 5px">音频输出设备</div>
            ${devices.map(d => `
                <div class="device-item"
                    data-device-id="${d.deviceId}"
                    style="padding:8px 12px;
                        cursor:pointer;
                        background:${d.deviceId === currentDevice?.deviceId ? '#444' : 'transparent'};
                        border-radius:4px;
                        margin:2px 0;
                        transition:background 0.2s;">
                    ${d.label}
                </div>
            `).join('')}
        `;

        // 添加点击事件监听器
        menu.querySelectorAll('.device-item').forEach(item => {
            item.addEventListener('click', async () => {
                const deviceId = item.dataset.deviceId;
                currentDevice = devices.find(d => d.deviceId === deviceId);
                localStorage.setItem('audioDevice', deviceId);
                await updateMediaElements();
                createDeviceList(); // 更新列表高亮状态
                toggleMenu(); // 选择后自动关闭菜单
            });
        });
    }

    async function updateMediaElements() {
        const mediaElements = document.querySelectorAll('video, audio');
        for (const media of mediaElements) {
            if (currentDevice && media.setSinkId) {
                try {
                    await media.setSinkId(currentDevice.deviceId);
                } catch(e) {
                    console.error('Failed to set sink:', e);
                }
            }
        }
    }

    function toggleMenu() {
        isMenuVisible = !isMenuVisible;
        menu.style.display = isMenuVisible ? 'block' : 'none';
    }

    // 主入口
    async function main() {
        await initDevices();
        createDeviceList();

        // 添加控制按钮
        const btn = document.createElement('div');
        btn.innerHTML = '🔊';
        btn.style = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #444;
            color: white;
            padding: 12px 15px;
            border-radius: 50%;
            cursor: pointer;
            z-index: 999999;
            font-size: 18px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: transform 0.2s;
        `;

        btn.addEventListener('mouseover', () => btn.style.transform = 'scale(1.1)');
        btn.addEventListener('mouseout', () => btn.style.transform = 'scale(1)');
        btn.addEventListener('click', toggleMenu);

        document.body.appendChild(btn);
        document.body.appendChild(menu);

        // 监听动态添加的媒体元素
        new MutationObserver(updateMediaElements)
            .observe(document, { subtree: true, childList: true });

        // 初始更新
        await updateMediaElements();
    }

    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !e.target.isEqualNode(btn)) {
            menu.style.display = 'none';
            isMenuVisible = false;
        }
    });

    window.addEventListener('load', main);
})();
