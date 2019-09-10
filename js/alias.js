$(function () {
    let nextGameSet = 2;
    let currentState = [1,1];
    let time = [180, 30];
    
    $(".btn_init").click(init);
    $(".btn_addSet").click(function () {
        let playerColumns = $(".game__column");
        for (let i = 0; i < playerColumns.length; i++) {
            playerColumns[i].append(roundSet(getSettings(), i, nextGameSet))
        }
        nextGameSet++;
        $(".results").hide();
    });
    $(".btn_score").click(function () {
        const result = getResults();
        let allString = '';
        for (let x in result.resultSimple) {
            if (result.resultSimple.hasOwnProperty(x)) {
                allString += `${x} scored ${result.resultSimple[x]}\n`
            }
        }
        $('.game__set').show();
        alert(allString);
    });
    $(".btn_results").click(function () {
        const result = getResults();
        let firstPlace = findTheWinner(result);
        let secondPlace = findTheWinner(result, true);
        //console.log(firstPlace, secondPlace);
        alert(`     First place: \n${firstPlace.names}\nWith the score of: ${firstPlace.score}
     Second place: \n${secondPlace.names}\nWith the score of: ${secondPlace.score}`);
    });
    $(".btn_next").click(function () {
        if (disableRound(currentState[0],currentState[1])) {
            currentState = nextRound(currentState);
        }
    });
    $(".btn_start").click(function () {
        let that = $(this);
        disable(that);
        disable($(".btn_next"));
        
        let mainTimer = setInterval(function () {
            updateMainTimer(time[0]);
            time[0] -= 1;
            if (time[0] < 0) {
                clearInterval(mainTimer);
                clearInterval(secondaryTimer);
                time[1] = 0;
                updateSecondaryTimer(0);
                enable(that);
                enable($(".btn_next"));
                setTimeout(function () {
                    time[0] = getSettings().time * 10;
                    time[1] = getSettings().skip * 10;
                }, 200);
                
            }
        }, 100);
        let secondaryTimer = setInterval(function () {
            updateSecondaryTimer(time[1]);
            time[1] -= 1;
            if (time[1] < 0) {
                clearInterval(secondaryTimer);
            }
        }, 100);
        
    });
    $(".btn_skip").click(function () {
        if (time[1] > 0) {
            time[1] = getSettings().skip * 10;
        } else {
            time[1] = getSettings().skip * 10;
            let secondaryTimer = setInterval(function () {
                updateSecondaryTimer(time[1]);
                time[1] -= 1;
                if (time[1] < 0) {
                    clearInterval(secondaryTimer);
                }
            }, 100);
        }
        
    });
    
    function init() {
        let settings = getSettings();
        //console.log(settings);
        $(".interface").hide(500);
        
        let groot = $("#groot");
        
        groot.append(createME('div', ['game', 'flex-css']));
        let game = $(".game");
        for (let i = 0; i < settings.names.length; i++) {
            const playerColumn = createME('div', ['game__column']);
            $(playerColumn).attr('data-player', settings.names[i]).width(`${100 / settings.names.length}%`);
            playerColumn.append(createME('div', ['game__player-nickname', 'grow'], settings.names[i]));
            
            playerColumn.append(roundSet(settings, i, 1));
            
            game.append(playerColumn);
        }
        $(".timer").css('display', 'flex');
        time = [settings.time * 10, settings.skip * 10];
    }
});

function disable(arg) {
    arg.addClass('disabled');
}

function enable(arg) {
    arg.removeClass('disabled');
}

function updateMainTimer(sec) {
    let timer = $('.timer_main');
    let minutes = Math.floor(sec / 600);
    let seconds = Math.floor((sec - (600 * minutes)) / 10);
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    let ms = sec - 600 * minutes - 10 * seconds;
    
    timer.find('.timer__minutes').text(`0${minutes}`);
    timer.find('.timer__seconds').text(`${seconds}`);
    timer.find('.timer__milliseconds').text(`${ms}`);
}

function updateSecondaryTimer(sec) {
    let timer = $('.timer_secondary');
    let seconds = Math.floor(sec / 10);
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    let ms = sec - 10 * seconds;
    
    timer.find('.timer__seconds').text(`${seconds}`);
    timer.find('.timer__milliseconds').text(`${ms}`);
}

function nextRound(arr) {
    let settings = getSettings();
    console.log(settings);
    if ( arr[1] < settings.names.length) {
        arr[1] += 1;
    } else {
        let x = $(`[data-set=${arr[0]}]`);
        x.hide();
        $(".results").show();
        arr[0] += 1;
        arr[1] = 1;
    }
    return arr;
}

function disableRound(set, round) {
    let x = $(`[data-set=${set}]`).find(`div[data-round=${round}] div`);
    if (x.length === 0) {
        return false;
    }
    x.addClass('disabled');
    return true;
}

function getResults() {
    const result = {
        namesArr: [],
        numbersArr: [],
        resultSimple: {}
    };
    const players = getSettings().names; // array of players
    for (let i = 0; i < players.length; i++) {
        let currentPlayer = players[i];
        let values = 0;
        $(`[data-player=${currentPlayer}] .cell__number`).each(function () {
            values += +$(this).text();
        });
        result[`${i+1} ${currentPlayer}`] = values;
        result.namesArr[i] = currentPlayer;
        result.numbersArr[i] = values;
        result.resultSimple[currentPlayer] = values;
    }
    console.log(result);
    return result;
}

function findTheWinner(data, second = false) {
    let firstPlace = Math.max(...data.numbersArr);
    if (second) {
        let x = data.numbersArr.filter(x => x < firstPlace);
        if (x.length !== 0) {
            firstPlace = Math.max(...x);
        }
    }
    let firstPlacers = [];
    let firstPlacersScore = [];
    data.numbersArr.forEach(function (value, index) {
        if (value === firstPlace) {
            firstPlacers[firstPlacers.length] = data.namesArr[index];
            firstPlacersScore[firstPlacersScore.length] = value;
        }
    });
    
    let obj = {};
    obj.names = firstPlacers.join(" | ");
    obj.score = firstPlacersScore[0];
    return obj;
}



function getSettings() {
    let settings = {};
    settings.names = $(".settings_names").val().split(' ');
    settings.time = +$(".settings_time").val();
    settings.skip = +$(".settings_skip").val();
    return settings;
}

function roundSet(settings, i, currentSet) {
    const set = createME('div', ['game__set']);
    $(set).attr('data-set', currentSet);
    
    for (let j = 0; j < settings.names.length; j++) {
        if (i === j) {
            set.append(roundCell(true, i + 1));
        } else {
            set.append(roundCell(false, j + 1));
        }
    }
    return set;
}

function roundCell(flag, round) {
    const wrapper = createME('div', ['game__cell', 'cell', 'flex-ccc']);
    $(wrapper).attr('data-round', round);
    const numberContainer = createME('span', ['cell__number'], 0);
    const countInc = createME('div', ['btn', 'cell__btn', 'btn_inc', 'flex-ccc'], '+');
    $(countInc).click(function () {
        changeValue(this);
    });
    const countDec = createME('div', ['btn', 'cell__btn', 'btn_dec', 'flex-ccc'], '-');
    $(countDec).click(function () {
        changeValue(this, false);
    });
    if (flag) {
        $(countInc).addClass('disabled');
        $(countDec).addClass('disabled');
        $(numberContainer).attr('data-round', round)
    }
    $(wrapper).append(numberContainer).append(countInc).append(countDec);
    return wrapper;
}

function changeValue(that, inc = true) {
    let action = -1;
    if ($(that).hasClass('disabled')) {
        return
    }
    if (inc) {
        action = 1;
    }
    const nearestValue = $(that).siblings(".cell__number");
    const roundAnchorman = $(that).closest(".game__cell");
    const round = roundAnchorman.attr("data-round");
    const set = roundAnchorman.parent().attr("data-set");
    const roundSet = $(that).closest(".game");
    const roundHead = roundSet.find(".game__column").eq(round - 1).find(`.game__set[data-set=${set}] .cell__number[data-round]`);
    nearestValue.text(+nearestValue.text() + action);
    roundHead.text(+roundHead.text() + action);
}

function createME(type = 'div', className = [], innerText = '') {
    const item = document.createElement(type);
    for (let i = 0; i < className.length; i++) {
        item.classList.add(className[i]);
    }
    item.innerHTML = innerText;
    return item;
}