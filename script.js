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
    // Reset player position
    gameState.playerX = 50;
    gameState.playerY = 50;
    gameState.keysCollected = [];

    // Stop any ongoing movement
    stopContinuousMovement();

    // Update player position and UI
    updatePlayerPosition();
    updateUI();

    // Reset all keys
    keys.forEach(key => {
        const keyContainer = document.getElementById(key.id);
        const keyElement = keyContainer.querySelector('.key');

        keyContainer.classList.remove('collected');
        keyElement.classList.remove('collected');
        keyElement.classList.add('hidden');
        keyElement.classList.remove('revealed');
        key.revealed = false;
    });

    // Hide win message
    winMessage.classList.add('hidden');

    // Reset joystick state
    joystickState.isDragging = false;
    joystickState.currentX = 0;
    joystickState.currentY = 0;
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
    const revealDistance = window.innerWidth <= 768 ? 60 : 80;
    const collectDistance = window.innerWidth <= 768 ? 35 : 45; // Improved collection distance

    keys.forEach(key => {
        const keyElement = document.getElementById(key.id);
        if (!keyElement) return;

        const playerCenterX = x + playerSize / 2;
        const playerCenterY = y + playerSize / 2;
        const keyCenterX = key.x + keySize / 2;
        const keyCenterY = key.y + keySize / 2;

        const distanceX = Math.abs(playerCenterX - keyCenterX);
        const distanceY = Math.abs(playerCenterY - keyCenterY);
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Auto-reveal keys when player gets close
        if (!key.revealed && distance < revealDistance) {
            revealKey(key.id);
        }

        // Improved collision detection - use circular collision for smoother feel
        if (!gameState.keysCollected.includes(key.letter) && key.revealed) {
            if (distance < collectDistance) {
                gameState.keysCollected.push(key.letter);

                const keyContainer = document.getElementById(key.id);
                const keyElementDOM = keyContainer.querySelector('.key');

                keyContainer.classList.add('collected');
                keyElementDOM.classList.add('collected');
                updateUI();
            }
        }
    });
}

function movePlayer(dx, dy) {
    const newX = gameState.playerX + dx;
    const newY = gameState.playerY + dy;

    // Try to move to the new position first
    if (!checkCollision(newX, newY)) {
        // For fast movements, check collision detection at intermediate points
        const steps = Math.max(Math.abs(dx), Math.abs(dy)) > 15 ? 3 : 1;

        for (let i = 1; i <= steps; i++) {
            const intermediateX = gameState.playerX + (dx * i / steps);
            const intermediateY = gameState.playerY + (dy * i / steps);
            checkKeyCollection(intermediateX, intermediateY);
        }

        gameState.playerX = newX;
        gameState.playerY = newY;
        updatePlayerPosition();
        checkKeyCollection(newX, newY);
    } else {
        // If diagonal movement is blocked, try moving along each axis separately
        const onlyX = gameState.playerX + dx;
        const onlyY = gameState.playerY + dy;

        // Try horizontal movement only
        if (dx !== 0 && !checkCollision(onlyX, gameState.playerY)) {
            gameState.playerX = onlyX;
            updatePlayerPosition();
            checkKeyCollection(onlyX, gameState.playerY);
        }
        // Try vertical movement only
        else if (dy !== 0 && !checkCollision(gameState.playerX, onlyY)) {
            gameState.playerY = onlyY;
            updatePlayerPosition();
            checkKeyCollection(gameState.playerX, onlyY);
        }
        // If both fail, try smaller incremental movements to prevent complete sticking
        else {
            const smallDx = dx * 0.5;
            const smallDy = dy * 0.5;
            const smallNewX = gameState.playerX + smallDx;
            const smallNewY = gameState.playerY + smallDy;

            if (!checkCollision(smallNewX, smallNewY)) {
                gameState.playerX = smallNewX;
                gameState.playerY = smallNewY;
                updatePlayerPosition();
                checkKeyCollection(smallNewX, smallNewY);
            }
        }
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
    maxDistance: window.innerWidth <= 768 ? 45 : 35,
    moveInterval: null,
    lastMoveTime: 0,
    currentX: 0,
    currentY: 0,
    deadZone: 0.15
};

const joystickHandle = document.getElementById('joystickHandle');
const joystickBase = document.querySelector('.joystick-base');

function initializeJoystick() {
    if (!joystickBase || !joystickHandle) return;

    // Update max distance based on screen size
    joystickState.maxDistance = window.innerWidth <= 768 ? 45 : 35;

    const baseRect = joystickBase.getBoundingClientRect();
    joystickState.centerX = joystickBase.offsetWidth / 2;
    joystickState.centerY = joystickBase.offsetHeight / 2;

    // Reset handle to center
    const handleSize = joystickHandle.offsetWidth / 2;
    joystickHandle.style.left = joystickState.centerX - handleSize + 'px';
    joystickHandle.style.top = joystickState.centerY - handleSize + 'px';

    // Reset movement state
    joystickState.currentX = 0;
    joystickState.currentY = 0;
    joystickState.isDragging = false;
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

    // Smooth interpolation to reduce jittering
    const handleSize = joystickHandle.offsetWidth / 2;
    const smoothX = handleX - handleSize;
    const smoothY = handleY - handleSize;

    joystickHandle.style.left = smoothX + 'px';
    joystickHandle.style.top = smoothY + 'px';

    // Store normalized position for continuous movement
    joystickState.currentX = (handleX - joystickState.centerX) / joystickState.maxDistance;
    joystickState.currentY = (handleY - joystickState.centerY) / joystickState.maxDistance;
}

function startContinuousMovement() {
    if (joystickState.moveInterval) return;

    joystickState.moveInterval = setInterval(() => {
        if (!joystickState.isDragging) return;

        const magnitude = Math.sqrt(joystickState.currentX * joystickState.currentX + joystickState.currentY * joystickState.currentY);

        if (magnitude > joystickState.deadZone) {
            const moveDistance = Math.min(gameState.gameWidth, gameState.gameHeight) * 0.02;
            const speed = Math.min(1, (magnitude - joystickState.deadZone) / (1 - joystickState.deadZone));

            // Direct mapping without quadratic easing for more responsive feel
            const finalX = joystickState.currentX * speed * moveDistance;
            const finalY = joystickState.currentY * speed * moveDistance;

            // Debug log to check values
            if (Math.abs(joystickState.currentX) > 0.1 || Math.abs(joystickState.currentY) > 0.1) {
                console.log(`Joystick: ${joystickState.currentX.toFixed(2)}, ${joystickState.currentY.toFixed(2)} -> Move: ${finalX.toFixed(2)}, ${finalY.toFixed(2)}`);
            }

            movePlayer(finalX, finalY);
        }
    }, 16); // 60fps
}

function stopContinuousMovement() {
    if (joystickState.moveInterval) {
        clearInterval(joystickState.moveInterval);
        joystickState.moveInterval = null;
    }
    joystickState.currentX = 0;
    joystickState.currentY = 0;
    joystickState.isDragging = false;
}

function resetJoystick() {
    if (!joystickHandle || !joystickBase) return;

    // Recalculate center in case screen size changed
    joystickState.centerX = joystickBase.offsetWidth / 2;
    joystickState.centerY = joystickBase.offsetHeight / 2;

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
    setTimeout(initializeJoystick, 200);
});

restartBtn.addEventListener('click', () => {
    resetGame();
    setTimeout(initializeJoystick, 200);
});

window.addEventListener('load', () => {
    if (!startPage.classList.contains('hidden')) return;
    initializeGame();
    initializeJoystick();
});

// Initialize joystick when game page becomes visible
window.addEventListener('resize', () => {
    if (!gamePage.classList.contains('hidden')) {
        updateGameDimensions();
        setupObstacles();
        setupKeys();
        setTimeout(initializeJoystick, 200);
    }
});