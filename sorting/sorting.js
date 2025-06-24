// Класс для решения головоломки
function LiquidSortingSolver(initialState) {
    // Сохраняем начальное состояние
    this.initialState = [];
    for (var i = 0; i < initialState.length; i++) {
        this.initialState.push([]);
        for (var j = 0; j < initialState[i].length; j++) {
            this.initialState[i].push(initialState[i][j]);
        }
    }
    
    this.numTubes = initialState.length;
    this.volume = this.numTubes > 0 ? initialState[0].length : 0;
}

// Проверка решения
LiquidSortingSolver.prototype.isSolved = function(state) {
    for (var i = 0; i < state.length; i++) {
        var tube = state[i];
        if (tube.length === 0) continue;
        var firstColor = tube[0];
        for (var j = 1; j < tube.length; j++) {
            if (tube[j] !== firstColor) return false;
        }
    }
    return true;
};

// Получение возможных ходов
LiquidSortingSolver.prototype.getPossibleMoves = function(state) {
    var moves = [];
    for (var fromIdx = 0; fromIdx < this.numTubes; fromIdx++) {
        for (var toIdx = 0; toIdx < this.numTubes; toIdx++) {
            if (fromIdx === toIdx) continue;
            if (state[fromIdx].length === 0) continue;
            if (state[toIdx].length >= this.volume) continue;

            var fromTop = state[fromIdx][state[fromIdx].length - 1];
            if (state[toIdx].length === 0 || state[toIdx][state[toIdx].length - 1] === fromTop) {
                var count = 1;
                for (var k = state[fromIdx].length - 2; k >= 0; k--) {
                    if (state[fromIdx][k] === fromTop) count++; else break;
                }
                var maxTransfer = Math.min(count, this.volume - state[toIdx].length);
                if (maxTransfer > 0) {
                    moves.push({ from: fromIdx, to: toIdx, amount: maxTransfer });
                }
            }
        }
    }
    return moves;
};

// Применение хода
LiquidSortingSolver.prototype.applyMove = function(state, move) {
    var newState = [];
    for (var i = 0; i < state.length; i++) {
        newState.push([]);
        for (var j = 0; j < state[i].length; j++) {
            newState[i].push(state[i][j]);
        }
    }
    
    var movedLiquid = newState[move.from].splice(-move.amount, move.amount);
    newState[move.to] = newState[move.to].concat(movedLiquid.reverse());
    
    return newState;
};

// Преобразование состояния в строку
LiquidSortingSolver.prototype.stateToString = function(state) {
    return state.map(tube => tube.join('')).join('|');
};

// Основной алгоритм решения
LiquidSortingSolver.prototype.solve = function() {
    if (this.isSolved(this.initialState)) return [];

    var queue = [{ state: this.initialState, moves: [] }];
    var visited = {};
    visited[this.stateToString(this.initialState)] = true;

    while (queue.length > 0) {
        var current = queue.shift();
        var possibleMoves = this.getPossibleMoves(current.state);

        for (var i = 0; i < possibleMoves.length; i++) {
            var move = possibleMoves[i];
            var newState = this.applyMove(current.state, move);
            var stateKey = this.stateToString(newState);

            if (!visited[stateKey]) {
                visited[stateKey] = true;
                var newMoves = current.moves.slice();
                newMoves.push({ from: move.from, to: move.to });

                if (this.isSolved(newState)) {
                    return newMoves;
                }

                queue.push({ state: newState, moves: newMoves });
            }
        }
    }

    return null;
};

// Пример использования
function main() {
    console.log("Решение:");
    
    // Начальное состояние пробирок
    var initialState = [
        ['R', 'G', 'B'],
        ['G', 'R', 'B'],
        ['B', 'G', 'R'],
        [],
        []
    ];

    console.log("\nНачальное состояние:");
    initialState.forEach((tube, i) => {
        console.log(`Пробирка ${i}: [${tube.join(', ')}]`);
    });

    // Создаем решатель
    var solver = new LiquidSortingSolver(initialState);

    var startTime = Date.now();
    var solution = solver.solve();
    var endTime = Date.now();

    if (solution) {
        console.log(`\nРешение найдено за ${(endTime - startTime)/1000} сек!`);
        console.log(`Количество ходов: ${solution.length}\n`);
        
        console.log("Последовательность ходов:");
        solution.forEach((move, i) => {
            console.log(`${i+1}. Из пробирки ${move.from} в пробирку ${move.to}`);
        });
    } else {
        console.log("\nРешение не найдено.");
    }
}

// Запускаем программу
main();