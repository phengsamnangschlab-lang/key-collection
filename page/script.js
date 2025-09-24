let gameState = {
    playerX: 50,
    playerY: 50,
    keysCollected: [],
    gameWidth: 0,
    gameHeight: 0,
    touchStartX: 0,
    touchStartY: 0
};

const player = document.getElementById('player');
const startBtn = document.getElementById('startBtn');
const startPage = document.getElementById('startPage');
const gamePage = document.getElementById('gamePage');
const keyCount = document.getElementById('keyCount');
const keysCollected = document.getElementById('keysCollected');
const winMessage = document.getElementById('winMessage');
const restartBtn = document.getElementById('restartBtn');
const gameArea = document.getElementById('gameArea');

let obstacles = [];
let keys = [];

function initializeGame() {
    updateGameDimensions();
    setupObstacles();
    setupKeys();
}

function updateGameDimensions() {
    const rect = gameArea.getBoundingClientRect();
    gameState.gameWidth = rect.width;
    gameState.gameHeight = rect.height;
}

function setupObstacles() {
    const obstacleElements = document.querySelectorAll('.obstacle');

    obstacles = [
        {x: gameState.gameWidth * 0.2, y: gameState.gameHeight * 0.15, width: gameState.gameWidth * 0.12, height: 20},
        {x: gameState.gameWidth * 0.4, y: gameState.gameHeight * 0.25, width: 20, height: gameState.gameHeight * 0.15},
        {x: gameState.gameWidth * 0.6, y: gameState.gameHeight * 0.35, width: gameState.gameWidth * 0.1, height: 20},
        {x: gameState.gameWidth * 0.25, y: gameState.gameHeight * 0.5, width: 20, height: gameState.gameHeight * 0.2},
        {x: gameState.gameWidth * 0.5, y: gameState.gameHeight * 0.6, width: gameState.gameWidth * 0.18, height: 20},
        {x: gameState.gameWidth * 0.75, y: gameState.gameHeight * 0.15, width: 20, height: gameState.gameHeight * 0.35},
        {x: gameState.gameWidth * 0.1, y: gameState.gameHeight * 0.85, width: gameState.gameWidth * 0.25, height: 20},
        {x: gameState.gameWidth * 0.65, y: gameState.gameHeight * 0.75, width: 20, height: gameState.gameHeight * 0.18}
    ];

    obstacleElements.forEach((element, index) => {
        if (obstacles[index]) {
            element.style.left = obstacles[index].x + 'px';
            element.style.top = obstacles[index].y + 'px';
            element.style.width = obstacles[index].width + 'px';
            element.style.height = obstacles[index].height + 'px';
        }
    });
}

function setupKeys() {
    const existingKeys = keys.length > 0 ? [...keys] : [];

    keys = [
        {id: 'keyI', x: gameState.gameWidth * 0.22, y: gameState.gameHeight * 0.2, letter: 'I', revealed: false},
        {id: 'keyL', x: gameState.gameWidth * 0.62, y: gameState.gameHeight * 0.65, letter: 'L', revealed: false},
        {id: 'keyU', x: gameState.gameWidth * 0.85, y: gameState.gameHeight * 0.9, letter: 'U', revealed: false}
    ];

    // Preserve revealed state from existing keys
    if (existingKeys.length > 0) {
        existingKeys.forEach(existingKey => {
            const newKey = keys.find(k => k.id === existingKey.id);
            if (newKey && existingKey.revealed) {
                newKey.revealed = true;
            }
        });
    }

    keys.forEach(key => {
        const keyContainer = document.getElementById(key.id);
        keyContainer.style.left = key.x + 'px';
        keyContainer.style.top = key.y + 'px';

        const keyElement = keyContainer.querySelector('.key');
        const characterElement = keyContainer.querySelector('.cute-character');

        // Remove click handlers since keys auto-reveal
        characterElement.onclick = null;
        characterElement.ontouchstart = null;

        // Update visual state based on revealed status
        if (key.revealed) {
            keyElement.classList.remove('hidden');
            keyElement.classList.add('revealed');
        } else {
            keyElement.classList.add('hidden');
            keyElement.classList.remove('revealed');
        }
    });
}

function startGame() {
    startPage.classList.add('hidden');
    gamePage.classList.remove('hidden');
    initializeGame();
    resetGame();
}

function resetGame() {
    gameState.playerX = 50;
    gameState.playerY = 50;
    gameState.keysCollected = [];
    updatePlayerPosition();
    updateUI();

    keys.forEach(key => {
        const keyContainer = document.getElementById(key.id);
        const keyElement = keyContainer.querySelector('.key');

        keyContainer.classList.remove('collected');
        keyElement.classList.remove('collected');
        keyElement.classList.add('hidden');
        keyElement.classList.remove('revealed');
        key.revealed = false;
    });

    winMessage.classList.add('hidden');
}

function revealKey(keyId) {
    const key = keys.find(k => k.id === keyId);
    if (!key || key.revealed) return;

    const keyContainer = document.getElementById(keyId);
    const keyElement = keyContainer.querySelector('.key');

    keyElement.classList.remove('hidden');
    keyElement.classList.add('revealed');
    key.revealed = true;
}

function updatePlayerPosition() {
    player.style.left = gameState.playerX + 'px';
    player.style.top = gameState.playerY + 'px';
}

function updateUI() {
    keyCount.textContent = `${gameState.keysCollected.length}/3`;
    keysCollected.textContent = gameState.keysCollected.join(' ');

    if (gameState.keysCollected.length === 3) {
        setTimeout(() => {
            winMessage.classList.remove('hidden');
            winMessage.classList.add('win-animation');
        }, 500);
    }
}

function checkCollision(newX, newY) {
    const playerSize = 20;

    if (newX < 0 || newX + playerSize > gameState.gameWidth ||
        newY < 0 || newY + playerSize > gameState.gameHeight) {
        return true;
    }

    for (let obstacle of obstacles) {
        if (newX < obstacle.x + obstacle.width &&
            newX + playerSize > obstacle.x &&
            newY < obstacle.y + obstacle.height &&
            newY + playerSize > obstacle.y) {
            return true;
        }
    }

    return false;
}

function checkKeyCollection(x, y) {
    const playerSize = window.innerWidth <= 768 ? 18 : 20;
    const keySize = window.innerWidth <= 768 ? 40 : 50;
    const revealDistance = window.innerWidth <= 768 ? 60 : 80; // Distance to auto-reveal keys

    keys.forEach(key => {
        // Auto-reveal keys when player gets close
        if (!key.revealed) {
            const distanceX = Math.abs(x + playerSize/2 - (key.x + keySize/2));
            const distanceY = Math.abs(y + playerSize/2 - (key.y + keySize/2));
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            if (distance < revealDistance) {
                revealKey(key.id);
            }
        }

        // Collect keys when player touches them
        if (!gameState.keysCollected.includes(key.letter) && key.revealed) {
            if (x < key.x + keySize && x + playerSize > key.x &&
                y < key.y + keySize && y + playerSize > key.y) {
                gameState.keysCollected.push(key.letter);

                const keyContainer = document.getElementById(key.id);
                const keyElement = keyContainer.querySelector('.key');

                keyContainer.classList.add('collected');
                keyElement.classList.add('collected');
                updateUI();
            }
        }
    });
}

function movePlayer(dx, dy) {
    const newX = gameState.playerX + dx;
    const newY = gameState.playerY + dy;

    if (!checkCollision(newX, newY)) {
        gameState.playerX = newX;
        gameState.playerY = newY;
        updatePlayerPosition();
        checkKeyCollection(newX, newY);
    }
}

document.addEventListener('keydown', (e) => {
    if (startPage.classList.contains('hidden')) {
        const moveDistance = Math.min(gameState.gameWidth, gameState.gameHeight) * 0.015;

        switch(e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                e.preventDefault();
                movePlayer(0, -moveDistance);
                break;
            case 's':
            case 'arrowdown':
                e.preventDefault();
                movePlayer(0, moveDistance);
                break;
            case 'a':
            case 'arrowleft':
                e.preventDefault();
                movePlayer(-moveDistance, 0);
                break;
            case 'd':
            case 'arrowright':
                e.preventDefault();
                movePlayer(moveDistance, 0);
                break;
        }
    }
});

window.addEventListener('resize', () => {
    if (!startPage.classList.contains('hidden')) return;

    updateGameDimensions();
    setupObstacles();
    setupKeys();

    gameState.playerX = Math.min(gameState.playerX, gameState.gameWidth - 20);
    gameState.playerY = Math.min(gameState.playerY, gameState.gameHeight - 20);
    updatePlayerPosition();
});

// Joystick controls
let joystickState = {
    isDragging: false,
    centerX: 0,
    centerY: 0,
    maxDistance: 35,
    moveInterval: null,
    lastMoveTime: 0,
    currentX: 0,
    currentY: 0
};

const joystickHandle = document.getElementById('joystickHandle');
const joystickBase = document.querySelector('.joystick-base');

function initializeJoystick() {
    if (!joystickBase || !joystickHandle) return;

    const baseRect = joystickBase.getBoundingClientRect();
    joystickState.centerX = joystickBase.offsetWidth / 2;
    joystickState.centerY = joystickBase.offsetHeight / 2;

    // Reset handle to center
    const handleSize = joystickHandle.offsetWidth / 2;
    joystickHandle.style.left = joystickState.centerX - handleSize + 'px';
    joystickHandle.style.top = joystickState.centerY - handleSize + 'px';
}

function handleJoystickMove(clientX, clientY) {
    if (!joystickState.isDragging) return;

    const baseRect = joystickBase.getBoundingClientRect();
    const deltaX = clientX - baseRect.left - joystickState.centerX;
    const deltaY = clientY - baseRect.top - joystickState.centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    let handleX, handleY;

    if (distance <= joystickState.maxDistance) {
        handleX = joystickState.centerX + deltaX;
        handleY = joystickState.centerY + deltaY;
    } else {
        const angle = Math.atan2(deltaY, deltaX);
        handleX = joystickState.centerX + Math.cos(angle) * joystickState.maxDistance;
        handleY = joystickState.centerY + Math.sin(angle) * joystickState.maxDistance;
    }

    // Update handle position immediately
    const handleSize = joystickHandle.offsetWidth / 2;
    joystickHandle.style.left = handleX - handleSize + 'px';
    joystickHandle.style.top = handleY - handleSize + 'px';

    // Store current position for continuous movement
    joystickState.currentX = (handleX - joystickState.centerX) / joystickState.maxDistance;
    joystickState.currentY = (handleY - joystickState.centerY) / joystickState.maxDistance;
}

function startContinuousMovement() {
    if (joystickState.moveInterval) return;

    joystickState.moveInterval = setInterval(() => {
        if (!joystickState.isDragging) return;

        const magnitude = Math.sqrt(joystickState.currentX * joystickState.currentX + joystickState.currentY * joystickState.currentY);

        if (magnitude > 0.1) {
            const moveDistance = Math.min(gameState.gameWidth, gameState.gameHeight) * 0.03;
            const speed = Math.min(1, magnitude);

            const finalX = joystickState.currentX * speed * moveDistance;
            const finalY = joystickState.currentY * speed * moveDistance;

            movePlayer(finalX, finalY);
        }
    }, 16); // ~60fps
}

function stopContinuousMovement() {
    if (joystickState.moveInterval) {
        clearInterval(joystickState.moveInterval);
        joystickState.moveInterval = null;
    }
    joystickState.currentX = 0;
    joystickState.currentY = 0;
}

function resetJoystick() {
    if (!joystickHandle) return;

    const handleSize = joystickHandle.offsetWidth / 2;
    joystickHandle.style.left = joystickState.centerX - handleSize + 'px';
    joystickHandle.style.top = joystickState.centerY - handleSize + 'px';
    joystickHandle.classList.remove('dragging');

    stopContinuousMovement();
}

// Mouse events for joystick
joystickHandle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    joystickState.isDragging = true;
    joystickHandle.classList.add('dragging');
    startContinuousMovement();
});

document.addEventListener('mousemove', (e) => {
    if (joystickState.isDragging) {
        e.preventDefault();
        handleJoystickMove(e.clientX, e.clientY);
    }
});

document.addEventListener('mouseup', () => {
    if (joystickState.isDragging) {
        joystickState.isDragging = false;
        resetJoystick();
    }
});

// Touch events for joystick
joystickHandle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    joystickState.isDragging = true;
    joystickHandle.classList.add('dragging');
    startContinuousMovement();
});

document.addEventListener('touchmove', (e) => {
    if (joystickState.isDragging && e.touches[0]) {
        e.preventDefault();
        const touch = e.touches[0];
        handleJoystickMove(touch.clientX, touch.clientY);
    }
}, { passive: false });

document.addEventListener('touchend', (e) => {
    if (joystickState.isDragging) {
        joystickState.isDragging = false;
        resetJoystick();
    }
});

document.addEventListener('touchcancel', (e) => {
    if (joystickState.isDragging) {
        joystickState.isDragging = false;
        resetJoystick();
    }
});

// Swipe controls
gameArea.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('cute-character')) return;

    gameState.touchStartX = e.touches[0].clientX;
    gameState.touchStartY = e.touches[0].clientY;
}, { passive: true });

gameArea.addEventListener('touchend', (e) => {
    if (!gameState.touchStartX || !gameState.touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = gameState.touchStartX - touchEndX;
    const diffY = gameState.touchStartY - touchEndY;

    const minSwipeDistance = 30;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                handleMovement('left');
            } else {
                handleMovement('right');
            }
        }
    } else {
        if (Math.abs(diffY) > minSwipeDistance) {
            if (diffY > 0) {
                handleMovement('up');
            } else {
                handleMovement('down');
            }
        }
    }

    gameState.touchStartX = 0;
    gameState.touchStartY = 0;
}, { passive: true });

function handleMovement(direction) {
    if (startPage.classList.contains('hidden')) {
        const moveDistance = Math.min(gameState.gameWidth, gameState.gameHeight) * 0.015;

        switch(direction) {
            case 'up':
                movePlayer(0, -moveDistance);
                break;
            case 'down':
                movePlayer(0, moveDistance);
                break;
            case 'left':
                movePlayer(-moveDistance, 0);
                break;
            case 'right':
                movePlayer(moveDistance, 0);
                break;
        }
    }
}

startBtn.addEventListener('click', () => {
    startGame();
    setTimeout(initializeJoystick, 100);
});

restartBtn.addEventListener('click', resetGame);

window.addEventListener('load', () => {
    if (!startPage.classList.contains('hidden')) return;
    initializeGame();
    initializeJoystick();
});

// Initialize joystick when game page becomes visible
window.addEventListener('resize', () => {
    if (!gamePage.classList.contains('hidden')) {
        setTimeout(initializeJoystick, 100);
    }
});